import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserData } from './userData';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }
  findAll() {
    return this.prisma.user.findMany()
  }
}
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private jwtService: JwtService) { }
  async register(UserData: UserData) {
    const createdUser = await this.prisma.user.create({
      data: {
        login: UserData.login,
        password: UserData.password,
        admin: false,
      },
    });
    return ('Успешно')
  }
  async login(UserData: UserData) {
    const user = await this.prisma.user.findUnique({
      where: {
        login: UserData.login,
      }
    })
    if (!user || user.password !== UserData.password) {
      return('Неверный логин или пароль')
    } else {
      const payload = { admin:user.admin};
      const token = this.generateToken(payload);
      return({
        "token":token,
        'admin':user.admin
      })
    }
  }
  generateToken(payload: any) {
    return this.jwtService.sign(payload);
  }
}