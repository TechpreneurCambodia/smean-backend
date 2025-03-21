import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy, Profile } from "passport-facebook";
import { VerifyCallback } from "passport-google-oauth20";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      clientID: process.env.FACEBOOK_APP_ID || '',
      clientSecret: process.env.FACEBOOK_APP_SECRET || '',
      callbackURL: process.env.FACEBOOK_REDIRECT_URL || '',
      scope: "public_profile",
      profileFields: ["name"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<any> {

    try {
      const { id, name, emails } = profile;
      const username = `user${id.split("-")}`;
      const user = {
        id: id,
        email: emails && emails.length > 0 ? emails[0].value : null,
        username: username,
        firstName: name && name.givenName ? name.givenName : null,
        lastName: name && name.familyName ? name.familyName : null,
        accessToken,
        refreshToken,
      };

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
  async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername;
    let counter = 1;

    // Check if the username exists in your database.
    while (await this.usernameExists(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }
    return username;
  }

  async usernameExists(username: string): Promise<boolean> {
    return this.userRepository.exists({ where: { username: username } });

  }


}
