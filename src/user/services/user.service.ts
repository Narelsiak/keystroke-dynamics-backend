// src/user/user.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from '../dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existing) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userData = {
      email: createUserDto.email,
      password: hashedPassword,
      isActive: true,
    };

    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({
      email: loginUserDto.email,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
