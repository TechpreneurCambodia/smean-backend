import { Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { AuthCredentialsDto } from "./dto/auth-credentials";

@Injectable()
export class AuthService {
  constructor(private usersRepository: UsersRepository) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    // Call the repository method to create a user
    await this.usersRepository.createUser(authCredentialsDto);
  }
}
