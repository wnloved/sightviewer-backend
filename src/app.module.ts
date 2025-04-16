import { Module } from '@nestjs/common';
import { UserController, AuntificationContrller } from './user/user.controller';
import { UserService, AuthService } from './user/user.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { SightController } from './sight/sight.controller';
import { SightService, UuidService } from './sight/sight.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.secure';
import { S3Service } from './s3/s3.servise';
@Module({
  imports: [ConfigModule.forRoot(),
  JwtModule.register({
    secret: process.env.JWT_SECRET || 'secretKey',
    signOptions: { expiresIn: '1h' },
  })],
  controllers: [UserController, SightController, AuntificationContrller],
  providers: [UserService, SightService, PrismaService, AuthService, JwtStrategy, UuidService, S3Service],
})
export class AppModule { }
