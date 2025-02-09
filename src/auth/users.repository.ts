import { DataSource, Repository } from 'typeorm';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findOneByUsername(username: string): Promise<User | null> {
    const userRepository = this.dataSource.getRepository(User);
    return await userRepository.findOne({ where: { username } });
  }

  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password, email, roleId } = authCredentialsDto;

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('salt:', salt);
    console.log('hashedPassword:', hashedPassword);

    const roleMappings: { [key: string]: number } = {
      admin: 1,
      user: 2,
    };

    const userRepository = this.dataSource.getRepository(User);

    // Check if the username already exists
    const existingUser = await userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    // Check if the email already exists
    const existingEmail = await userRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    const resolvedRoleId =
      roleMappings[roleId as keyof typeof roleMappings] || 2; // Default to 'user'
    
    // Create a new user instance
    const user = userRepository.create({
      username,
      password: hashedPassword,
      email,
      role_id: resolvedRoleId, // Ensure your entity uses `role_id` instead of `roleId`
    });

    // Save the user to the database
    try {
      await userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username is already taken');
      } else if (error.code === '23502') {
        throw new ConflictException('Role ID is invalid');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
