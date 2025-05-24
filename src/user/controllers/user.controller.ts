// src/user/user.controller.ts
import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
  Get,
  UnauthorizedException,
  Res,
} from '@nestjs/common';

import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { Request, Response } from 'express';
import { LoginUserDto } from '../dto/login-user.dto';
import { KeystrokeService } from 'src/keystroke/services/keystroke.service';

@Controller('users')
export class UserController {
  // wstrzykniecie serwisu do kontrolera
  constructor(
    private readonly userService: UserService,
    private readonly keystrokeService: KeystrokeService, // <--- dodaj to
  ) {}

  // users/register
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userService.register(createUserDto);

      req.session.userId = user.id;
      return new UserResponseDto(user);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: Request,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userService.login(loginUserDto);
      req.session.userId = user.id;

      await this.keystrokeService.validateUserStyle(
        user.id,
        loginUserDto.keyPresses,
      );

      return new UserResponseDto(user);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        throw new BadRequestException('Logout failed');
      }
      res.clearCookie('connect.sid');
      return res.send({ success: true });
    });
  }

  @Get('profile')
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
}
