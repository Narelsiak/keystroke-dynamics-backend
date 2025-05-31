// src/user/user.controller.ts
import { Controller, Get } from '@nestjs/common';

import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { UsersResponseDto } from '../dto/users-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @ApiOkResponse({
    description: 'Returns all users with active secretWord',
    type: UserResponseDto,
    isArray: true,
  })
  async getAllUsers(): Promise<UsersResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map((user) => new UsersResponseDto(user));
  }
}
