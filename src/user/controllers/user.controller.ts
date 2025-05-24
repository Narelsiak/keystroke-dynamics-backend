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
  Patch,
} from '@nestjs/common';

import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { Request, Response } from 'express';
import { LoginUserDto } from '../dto/login-user.dto';
import { KeystrokeService } from 'src/keystroke/services/keystroke.service';
import { KeystrokeAttemptService } from 'src/keystroke/services/keystroke-attempt.service';
import { KeyPressDto } from 'src/keystroke/dto/key-press.dto';
import { SetSecretWordDto } from 'src/keystroke/dto/set-secret-word.dto';

@Controller('users')
export class UserController {
  // wstrzykniecie serwisu do kontrolera
  constructor(
    private readonly userService: UserService,
    private readonly keystrokeService: KeystrokeService,
    private readonly keystrokeAttemptService: KeystrokeAttemptService,
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

  @Get('users')
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map((user) => new UserResponseDto(user));
  }

  @Patch('secret-word')
  async setSecretWord(
    @Body() body: SetSecretWordDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    await this.userService.updateSecretWord(userId, body.secretWord);

    return { message: 'Secret word updated successfully' };
  }

  @Post('add-data')
  async addData(
    @Body()
    body: {
      keyPresses: KeyPressDto[];
      secretWord: string;
    },
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const user = await this.userService.findById(userId);

    if (user?.secretWord !== body.secretWord) {
      throw new UnauthorizedException('Invalid secret word');
    }

    const { success, keyPresses } = this.keystrokeService.validateUserStyle(
      body.keyPresses,
      body.secretWord,
    );

    if (success) {
      await this.keystrokeAttemptService.saveAttempt(userId, keyPresses);
    } else {
      throw new BadRequestException('Keystroke validation failed');
    }

    return { success };
  }
}
