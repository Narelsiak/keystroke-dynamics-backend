// src/user/user.controller.ts
import { Controller, Get, Req } from '@nestjs/common';

import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { UsersResponseDto } from '../dto/users-response.dto';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @ApiOkResponse({
    description: 'Returns all users with active secretWord',
    type: UserResponseDto,
    isArray: true,
  })
  async getAllUsers(@Req() req: Request): Promise<UsersResponseDto[]> {
    const userId = req.session.userId;
    const users = await this.userService.findAll();
    return users.map((user) => new UsersResponseDto(user, userId));
  }
}
