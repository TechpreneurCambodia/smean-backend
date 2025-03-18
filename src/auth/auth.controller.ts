import { Controller, Get, Post, Body, Query, UseGuards, Request, ValidationPipe, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { GoogleOAuthGuard } from './google-oauth.guard';
import { GoogleDto } from './dto/google.dto';
import { FacebookOAuthGuard } from './facebook-oauth.guard';
import { FacebookDto } from './dto/facebook.dto';
import { AuthGuard } from './auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

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
    return this.authService.getMe(req.user);
  }

  @Get("/google")
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) { }

  @Get('/google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() req) {
    const user = req.user;
    const googleDto = new GoogleDto();
    googleDto.email = user.email;
    googleDto.firstName = user.firstName;
    googleDto.lastName = user.lastName;
    googleDto.profilePicUrl = user.picture;
    googleDto.accessToken = user.accessToken;
    googleDto.username = user.email;
    const response = this.authService.CreateOrSignInWithGoogle(googleDto);
    return response;
  }
  @Get("/facebook")
  @UseGuards(FacebookOAuthGuard)
  async facebookLogin(@Request() req) {
  }

  @Get("/facebook/callback")
  @UseGuards(FacebookOAuthGuard)
  async facebookLoginRedirect(@Request() req) {
    const user = req.user;
    const facebookDto = new FacebookDto();
    facebookDto.facebookId = user.id;
    facebookDto.email = user.email;
    facebookDto.firstName = user.firstName;
    facebookDto.lastName = user.lastName;
    facebookDto.accessToken = user.accessToken;
    const response = this.authService.CreateOrSignInWithFacebook(facebookDto);
    return response;
  }

}
