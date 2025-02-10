import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { AuthCredentialsDto } from "./dto/auth-credentials";
import { SignInDto } from "./dto/sign-in.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./jwt-payload-interface";
import { UserDetails } from "./utils/types";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";

@Injectable()
export class AuthService {
  async findUserById(id: number) {
    const user = await this.usersRepository.findOneBy({ id: id.toString() });
    return user;
  }
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}
  // validateUser(details: UserDetails) {
  //   return { username: details.displayname, email: details.gemail };
  // }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    // Call the repository method to create a user
    await this.usersRepository.createUser(authCredentialsDto);
  }
  // async signIn(signInDto: SignInDto): Promise<{accessToken: string}> {
  //   const {usernameOrEmail, password } = signInDto;
  //   const isEmail = usernameOrEmail.includes('@');
  //   const user = isEmail
  //     ? await this.usersRepository.findOne({ where: { email: usernameOrEmail } })
  //     : await this.usersRepository.findOne({ where: { username: usernameOrEmail } });

  //   if (!user) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }


  //   if (user && (await bcrypt.compare(password, user.password))) {
  //     const payload: JwtPayload = { 
  //       username: user.username,
  //       email: user.email, };
  //     const accessToken: string = await this.jwtService.sign(payload);
  //     return { accessToken };
  //   } else {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }
  // }
  // async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
  //   console.log('Received SignInDto:', signInDto);  // Debugging
  //   const { usernameOrEmail, password } = signInDto;
    
  //   if (!usernameOrEmail || usernameOrEmail.length < 4) {
  //     throw new UnauthorizedException('Invalid username or email');
  //   }
  
  //   const isEmail = usernameOrEmail.includes('@');
  //   const user = isEmail
  //     ? await this.usersRepository.findOne({ where: { email: usernameOrEmail } })
  //     : await this.usersRepository.findOne({ where: { username: usernameOrEmail } });
  
  //   if (!user) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }
  
  //   if (await bcrypt.compare(password, user.password)) {
  //     const payload: JwtPayload = { username: user.username, email: user.email };
  //     const accessToken: string = await this.jwtService.sign(payload);
  //     return { accessToken };
  //   } else {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }
  // }
  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const { usernameOrEmail, password } = signInDto;
    const user = await this.usersRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username: user.username };
      const accessToken = await this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async validateUser(userDetails: UserDetails): Promise<User> {
    // Implement your user validation logic here
    // For example, find the user in the database and return the user object
    const user = await this.usersRepository.findOne({
      where: { email: userDetails.gemail },
    });
    if (user) return user;
    console.log('User not found, creating a new user...');
    if (!user) {
      // If the user does not exist, create a new user
      const newUser = this.usersRepository.create({
        username: userDetails.displayname,
        email: userDetails.gemail,
        password: '', // Set a default password or handle it appropriately
        role_id: 2, // Set a default role or handle it appropriately ex 2 for user
      });
      return await this.usersRepository.save(newUser);
    }
    return user;
  }
}
