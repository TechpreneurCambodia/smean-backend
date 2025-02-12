import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "../auth.service";
import { UserDetails } from "./types";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google'){
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
    if (
      !configService.get<string>('GOOGLE_CLIENT_ID') ||
      !configService.get<string>('GOOGLE_CLIENT_SECRET') ||
      !configService.get<string>('GOOGLE_CALLBACK_URL')
    ) {
      throw new Error(
        'Google clientID, clientSecret and callbackURL must be defined'
      );
    }
  }

  async validate(request: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    _done: VerifyCallback): Promise<any> {
      try {
        console.log('accessToken:', accessToken);
        console.log('refreshToken:', refreshToken);
        console.log('profile:', profile);
    
        const userDetails: UserDetails = {
          displayname: profile.displayName,
          gemail: profile.emails ? profile.emails[0].value : '',
          username: undefined
        };
    
        const user = await this.authService.validateUser(userDetails);
        console.log('validate');
        console.log('user');
        return user || null;
      } catch (error) {
        console.error('Error during Google OAuth validation:', error);
        _done(error, false);
      }
    }
}