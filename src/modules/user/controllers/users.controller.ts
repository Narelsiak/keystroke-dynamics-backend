// src/user/user.controller.ts
import { Controller, Get } from '@nestjs/common';

import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map((user) => new UserResponseDto(user));
  }
}
