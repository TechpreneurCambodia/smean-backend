import { PassportSerializer } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { User } from "../user.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(private readonly authService: AuthService,) {
        super();
    }
    serializeUser(user: User, done: Function) {
      console.log('serializeUser');
        done(null, user);
    }
    async deserializeUser(payload, done) {
    try {
        const user = await this.authService.findUserById(payload.id);
        console.log('deserializeUser');
        console.log('user');
        done(null, user);
    } catch (error) {
        done(error, null);
    }
  }
}