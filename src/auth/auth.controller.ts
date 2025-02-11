import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { Getuser } from './get-user-decorator';
import { User } from './user.entity';
import { GoogleAuthGuard } from './utils/Guards';
import { UserDetails } from './utils/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleGoogleLogin() {
    return { msg: 'This route is for Google login' };
  }
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleRedirect(@Req() req: Request & { user: UserDetails }) {
    try {
      // Implement Google OAuth code exchange and return user info
      const user = req.user;
      const payload = { username: user.username };

      // Check if user exists, if not, register the user
      let accessToken;
      try {
        accessToken = await this.authService.signIn({
          usernameOrEmail: user.gemail,
          password: '',
        });
      } catch (error) {
        if (error.status === 401) {
          // User does not exist, register the user
          await this.authService.signUp({
            username: user.username,
            email: user.gemail,
            password: '', // You might want to generate a random password or handle it differently
          });
          accessToken = await this.authService.signIn({
            usernameOrEmail: user.gemail,
            password: '',
          });
        } else {
          throw error;
        }
      }

      return { msg: 'Google OAuth redirect successful', accessToken };
    } catch (error) {
      console.error('Error during Google OAuth redirect:', error);
      throw new Error('Google OAuth redirect failed');
    }
  }

  @Get('status')
  user(@Req() req: Request & { user: UserDetails }) {
    if (req.user) {
      return { user: req.user, msg: 'User is authenticated' };
    }else {
      return { msg: 'User is not authenticated' };
    }
  }

  @Post('/signup')
  @UsePipes(new ValidationPipe({ whitelist: true })) // Enable validation here
  signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }

  @Post('/signin')
  @UsePipes(new ValidationPipe({ whitelist: true })) // Enable validation here
  async signIn(@Body() signInDto: SignInDto): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInDto); // Pass SignInDto to service
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  getMe(@Getuser() user: User): User {
    return user;
  }
}
