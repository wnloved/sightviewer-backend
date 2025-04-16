import { Controller, Get, Post, Body, Inject, UseInterceptors, UploadedFile, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { SightService, UuidService } from './sight.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as multer from 'multer';
import { SightData } from './sight.data';
import { UserData } from 'src/user/userData';
import { AuthGuard } from '@nestjs/passport';
function isEmptyBlob(blob: Express.Multer.File): boolean {
  return blob?.buffer?.length === 0;
}
@Controller('sights')
@UseGuards(AuthGuard('jwt'))
export class SightController {
  constructor(private readonly SightService: SightService, @Inject(UuidService) private readonly uuidService: UuidService) { }
  @Get()
  findAll() {
    return this.SightService.findAllShort();
  }
  @Post("/new")
  @UseInterceptors(FileInterceptor('file'))
  async new(@UploadedFile() file: Express.Multer.File, @Body() SightData) {
    var DataParse = JSON.parse(SightData.data)
    return this.SightService.AddNewSight(DataParse, file)
  }
  @Post("/getInfo")
  async findOne(@Body() SightData: SightData) {
    return this.SightService.findOne(SightData)
  }
  @Get("/getAllAdmin")
  async findMany(@Req() req) {
    const user = req.user;
    if (user.admin!=true){
      return 'Вы не админ!'
    }else{
    return this.SightService.findAll()}
  }
  @Put('/edit')
  @UseInterceptors(FileInterceptor('file'))
  async edit(@UploadedFile() file: Express.Multer.File, @Body() SightData, @Req() req) {
    const user = req.user;
    if (user.admin!=true){
      return 'Вы не админ'}
    else{
    var DataParse = JSON.parse(SightData.data)
    if (isEmptyBlob(file)) {
      return this.SightService.EditSight(DataParse, null);
    }else{
    return this.SightService.EditSight(DataParse, file);}}
  }
  @Post("/NewRating")
  async NewRating( @Body('SightData') SightData: SightData,@Body('UserData') UserData: UserData,){
    return this.SightService.NewRating(SightData, UserData)
  }
  @Delete('/delete')
  async delete(@Body() SightData:SightData){
    return this.SightService.DeleteSight(SightData)
  }
}
