import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SightData } from './sight.data';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from 'src/s3/s3.servise';
import { UserData } from 'src/user/userData';
@Injectable()
export class UuidService {
  generateUuid(): string {
    return uuidv4();
  }
}
@Injectable()
export class SightService {
  constructor(private readonly prisma: PrismaService, private readonly uuid: UuidService, private readonly s3: S3Service) { }
  findAllShort() {
    var res = this.prisma.sight.findMany({
      select: {
        identificator: true,
        name: true,
        place:true,
        maps:true,
        photo_uuid: true,
        rating: true,
        watchedClients:true
      }
    })
    return res
  }
  async AddNewSight(SightData: SightData, file: Express.Multer.File) {
    const uuidPhoto = await this.s3.AddNewSight(file.buffer)
    const uuidSight = this.uuid.generateUuid()
    const yandexURL = `https://yandex.ru/maps/?ll=${SightData.longitude},${SightData.latitude}&z=16`
    const createdSight = await this.prisma.sight.create({
      data: {
        identificator: uuidSight,
        name: SightData.name,
        description: SightData.description,
        place: SightData.place,
        latitude: SightData.latitude,
        longitude: SightData.longitude,
        maps: yandexURL,
        photo_uuid: uuidPhoto,
        watchedClients:[],
        quantity: 0,
        count: 0,
        rating: 0
      },
    });
    return ({ succsess: "Успешно" })
  }
  async findOne(SightData: SightData) {
    const sight = await this.prisma.sight.findUnique({
      select: {
        identificator: true,
        name: true,
        description: true,
        place: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        maps: true,
        watchedClients:true,
        photo_uuid: true,
        rating: true
      },
      where: {
        identificator: SightData.identificator,
      }
    })
    return sight
  }
  findAll() {
    var res = this.prisma.sight.findMany({
      select: {
        identificator: true,
        name: true,
        description: true,
        place: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        maps: true,
        watchedClients:true,
        photo_uuid: true,
        rating: true
      }
    })
    return res
  }
  async EditSight(SightData: SightData, file: Express.Multer.File | null) {
    const yandexURL = `https://yandex.ru/maps/?ll=${SightData.longitude},${SightData.latitude}&z=16`
    if (file == null){
      await this.prisma.sight.update({
        where: {
          identificator: SightData.identificator,
        }, 
        data:{
          name: SightData.name,
          description: SightData.description,
          place: SightData.place,
          latitude: SightData.latitude,
          longitude: SightData.longitude,
          maps: yandexURL,
        }
      })
    }
    else{
      const photoUUid = await this.prisma.sight.findUnique({
        where:{
          identificator: SightData.identificator,
        },
        select:{
          photo_uuid:true
        }
      })
      const UpdateduuidPhoto = await this.s3.EditSight(file.buffer, photoUUid)
      await this.prisma.sight.update({
        where: {
          identificator: SightData.identificator,
        }, 
        data:{
          name: SightData.name,
          description: SightData.description,
          place: SightData.place,
          latitude: SightData.latitude,
          longitude: SightData.longitude,
          maps: yandexURL,
          photo_uuid: UpdateduuidPhoto
        }
      })
    }
  }
  async NewRating(SightData: SightData, UserData:UserData) {
    try {
      const legacyRating = await this.prisma.sight.findUnique({
        where: {
          identificator: SightData.identificator,
        },
        select: {
          quantity: true,
          count: true,
          watchedClients:true
        }
      });
      if (!legacyRating) {
        throw new Error(`Запись с идентификатором ${SightData.identificator} не найдена.`);
      }
  
      const newQuantity = legacyRating.quantity ? legacyRating.quantity + 1 : 1;
      const newCount = legacyRating.count ? legacyRating.count + SightData.count : SightData.count;
      const newClientsArray = legacyRating.watchedClients ? legacyRating.watchedClients.concat([UserData.login]):  legacyRating.watchedClients;
      if (newQuantity === 0) {
        throw new Error('Количество оценок не может быть нулевым.');
      }
      
      await this.prisma.sight.update({
        where: {
          identificator: SightData.identificator,
        },
        data: {
          quantity: newQuantity,
          count: newCount,
          rating: newCount / newQuantity,
          watchedClients: newClientsArray
        }
      });
    } catch (error) {
      console.error(error.message);
    }
    return 'Успешно'
  }
  async DeleteSight(SightData:SightData){
    const deltedSight = this.prisma.sight.delete({
      where: {
        identificator: SightData.identificator,
      }
    })
    return deltedSight
  }
}