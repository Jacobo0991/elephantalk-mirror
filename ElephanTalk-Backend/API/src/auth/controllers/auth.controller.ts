import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CreateUserDto } from 'src/users/dtos/user.dto';
import { UsersService } from 'src/users/services/users.service';
import { AuthInfoDto } from '../dto/auth.dto';
import { loginExamples } from '../swagger/examples';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RequestUser } from 'src/common/models/requestUser.model';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private userService: UsersService) {}

  /**
   * Login with username or email
   */
  @ApiBody({ type: AuthInfoDto, examples: loginExamples })
  @ApiCreatedResponse({ description: 'User logged in' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request) {
    return req.user;
  }

  /**
   * Login with admin credentials
   */
  @ApiBody({ type: AuthInfoDto, examples: loginExamples })
  @ApiCreatedResponse({ description: 'Admin logged in' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @UseGuards(AuthGuard('local-admin'))
  @Post('login/admin')
  loginAdmin(@Req() req: Request) {
    return req.user;
  }

  /**
   * Register a new user
   */
  @ApiCreatedResponse({ description: 'User registered' })
  @ApiBadRequestResponse({
    description: 'Email or username already exists - Invalid create data',
  })
  @Post('register')
  async register(@Body() payload: CreateUserDto) {
    return {
      data: await this.userService.create(payload),
    };
  }

  /**
   * Get current user info
   */
  @Get('whoami')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @UseGuards(JwtAuthGuard)
  async whoami(@Req() req: Request) {
    const { id } = req.user as RequestUser;

    return {
      data: await this.userService.findOwnProfile(id),
    };
  }
}
