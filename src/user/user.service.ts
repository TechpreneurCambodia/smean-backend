import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { GoogleDto } from 'src/auth/dto/google.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) { }

  async create(createUserDto: CreateUserDto | GoogleDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users.map(user => this.removeSensitiveInfo(user));
  }

  async findOne(id: string): Promise<User> {
    const user = await this.findUserById(id);
    return this.removeSensitiveInfo(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const updatedUser = this.userRepository.merge(user, updateUserDto);
    updatedUser.updatedAt = new Date();

    const savedUser = await this.userRepository.save(updatedUser);

    return this.removeSensitiveInfo(savedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findUserById(id);
    await this.userRepository.remove(user);
  }

  async findByEmail(email: string): Promise<any> {
    return this.userRepository.findOne({ where: { email } }) ?? undefined;
  }

  private async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private removeSensitiveInfo(user: User): User {
    delete user.refreshToken;
    delete user.accessToken;
    delete user.password;
    return user;
  }
}
