import { Repository, DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { User } from "./user.entity";
import { AuthCredentialsDto } from "./dto/auth-credentials";

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password, email, roleId } = authCredentialsDto;
    const roleMappings: { [key: string]: number } = {
      admin: 1,
      user: 2,
    };
    const existingUser = await this.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('Username is already taken');
    }

    // Check if the email already exists
    const existingEmail = await this.findOne({ where: { email } });
    if (existingEmail) {
      throw new Error('Email is already registered');
    }

    const resolvedRoleId = roleMappings[roleId as keyof typeof roleMappings] || 2; // Default to 'user'

    // Create a new user instance
    const user = this.create({ username, password, email, role_id: resolvedRoleId });

    // Save the user to the database
    await this.save(user);
  }
}
