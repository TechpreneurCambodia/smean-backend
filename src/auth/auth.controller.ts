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
      const user = req.user;

      // Check if the user exists in the database before trying to register
      let existingUser = await this.authService.findUserByEmail(user.gemail);

      if (!existingUser) {
        // User does not exist, so we register them
        await this.authService.signUp({
          username: user.username,
          email: user.gemail,
          password: '', // Consider handling this properly
        });

        // Fetch the newly created user
        existingUser = await this.authService.findUserByEmail(user.gemail);
      }

      // Generate access token
      const accessToken = await this.authService.signIn({
        usernameOrEmail: existingUser?.email ?? '',
        password: '', // Consider handling password logic properly
      });

      return { msg: 'Google OAuth redirect successful', accessToken };
    } catch (error) {
      if (error.code === 'invalid_grant') {
        console.error('Invalid grant during Google OAuth redirect:', error);
        throw new Error('Invalid grant during Google OAuth redirect');
      }
      console.error('Error during Google OAuth redirect:', error);
      throw new Error('Google OAuth redirect failed');
    }
  }

  @Get('status')
  user(@Req() req: Request & { user: UserDetails }) {
    if (req.user) {
      return { user: req.user, msg: 'User is authenticated' };
    } else {
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
