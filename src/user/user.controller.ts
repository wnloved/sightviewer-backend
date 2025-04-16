import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UserService, AuthService } from './user.service';
import { UserData } from './userData';
import { AuthGuard } from '@nestjs/passport';
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) { }
  @Get()
  async findAll(@Req() req) {
    const user = req.user
    if (user.admin != true) {
      return 'You are not admin!!'
    }
    else {
      return this.userService.findAll();
    }
  }
  @Get('/verificate')
  async verificate(@Req() req) {
    const user = req.user
    if (user.admin != true) {
      return { 'admin': 'notAdmin' }
    }
    else {
      return { 'admin': 'Admin' }
    }
  }
}
@Controller('auntification')
export class AuntificationContrller {
  constructor(private readonly authService: AuthService) { }
  @Post("/reg")
  async register(@Body() UserData: UserData) {
    return this.authService.register(UserData)
  }
  @Post("/login")
  async generateToken(@Body() UserData: UserData) {
    return this.authService.login(UserData)
  }
}