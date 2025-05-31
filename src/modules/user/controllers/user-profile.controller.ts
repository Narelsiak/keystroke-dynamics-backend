// src/user/auth.controller.ts
import {
  Controller,
  Req,
  Get,
  UnauthorizedException,
  Patch,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { Request } from 'express';
import { UpdateUserNameDto } from '../dto/update-user-data.dto';

@Controller('user')
export class UserProfileController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getProfile(@Req() req: Request): Promise<UserResponseDto> {
    if (!req.session.userId) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findById(req.session.userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return new UserResponseDto(user);
  }
  @Patch('name')
  async updateUserName(
    @Body() body: UpdateUserNameDto,
    @Req() req: Request,
  ): Promise<UserResponseDto> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    await this.userService.updateUserName(
      userId,
      body.firstName,
      body.lastName,
    );

    const updatedUser = await this.userService.findById(userId);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return new UserResponseDto(updatedUser);
  }
}
