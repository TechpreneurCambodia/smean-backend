import { Controller, Get, Post, Body, Query, UseGuards, Request, ValidationPipe, UsePipes, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthGuard } from './auth.guard';
import { plainToInstance } from 'class-transformer';
import { UserDto } from 'src/user/dto/user.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  @HttpCode(200)
  @Post('/login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Get('/verify')
  verify(@Query('token') token: string) {
    return this.authService.verifyToken(token);
  }

  @Post('/refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('/logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
  @Get('/me')
  @UseGuards(AuthGuard)
  getMe(@Request() req) {
    const user = this.authService.getMe(req.user.id);
    return plainToInstance(UserDto, user);
  }

}
