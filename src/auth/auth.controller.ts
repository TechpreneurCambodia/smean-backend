import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { Getuser } from './get-user-decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @UsePipes(new ValidationPipe({ whitelist: true })) // Enable validation here
  signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }

  @Post('/signin')
  @UsePipes(new ValidationPipe({ whitelist: true })) // Enable validation here
  async signIn(@Body() signInDto: SignInDto):  Promise<{accessToken: string}> {
    return this.authService.signIn(signInDto); // Pass SignInDto to service

  }
  
  @Get('/me')
  @UseGuards(AuthGuard())
  getMe(@Getuser() user: User): User {
    return user;
  }
}
