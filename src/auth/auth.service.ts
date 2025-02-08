import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { AuthCredentialsDto } from "./dto/auth-credentials";
import { SignInDto } from "./dto/sign-in.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./jwt-payload-interface";

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    // Call the repository method to create a user
    await this.usersRepository.createUser(authCredentialsDto);
  }
  async signIn(signInDto: SignInDto): Promise<{accessToken: string}> {
    const { username, password } = signInDto;
    const user = await this.usersRepository.findOneByUsername(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { username };
      const accessToken: string = await this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
