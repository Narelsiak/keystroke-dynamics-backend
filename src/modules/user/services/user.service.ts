// src/user/user.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from '../dto/login-user.dto';
import { SecretWord } from '../entities/secret-word.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(SecretWord)
    private secretWordRepository: Repository<SecretWord>,
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
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      relations: ['secretWords', 'secretWords.models', 'secretWords.attempts'],
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
    return this.userRepository.findOne({
      where: { id },
      relations: [
        'secretWords',
        'secretWords.models',
        'passwordCrackTargets',
        'passwordCrackAttempts',
        'passwordCrackTargets.user',
        'passwordCrackAttempts.user',
        'passwordCrackAttempts.secretWord',
        'passwordCrackTargets.secretWord',
      ],
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['secretWords', 'secretWords.models', 'secretWords.attempts'],
    });
  }

  async addSecretWord(userId: number, secretWord: string): Promise<SecretWord> {
    const secretWordEntity = this.secretWordRepository.create({
      user: { id: userId },
      word: secretWord,
      isActive: true,
    });

    return await this.secretWordRepository.save(secretWordEntity);
  }

  async deactivateAllSecretWords(userId: number): Promise<void> {
    await this.secretWordRepository
      .createQueryBuilder()
      .update()
      .set({ isActive: false })
      .where('user_id = :userId', { userId })
      .execute();
  }

  async updateUserName(
    userId: number,
    firstName?: string,
    lastName?: string,
  ): Promise<void> {
    const updatePayload: Partial<User> = {};
    if (firstName !== undefined) updatePayload.firstName = firstName;
    if (lastName !== undefined) updatePayload.lastName = lastName;

    await this.userRepository.update({ id: userId }, updatePayload);
  }
  async hasUserUsedSecretWord(userId: number, word: string): Promise<boolean> {
    const count = await this.secretWordRepository.count({
      where: { user: { id: userId }, word },
    });
    return count > 0;
  }
  async findSecretWord(userId: number, word: string) {
    return await this.secretWordRepository.findOne({
      where: { user: { id: userId }, word },
    });
  }

  async activateSecretWord(id: number) {
    await this.secretWordRepository.update(id, { isActive: true });
    return this.secretWordRepository.findOne({ where: { id } });
  }
}
