import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { MongoIdPipe } from 'src/common/pipes/mongo/mongo-id.pipe';
import { UpdateUserDto, UpdateUserRoleDto } from '../dtos/user.dto';
import { Types } from 'mongoose';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/models/roles.model';
import { Request } from 'express';
import { RequestUser } from 'src/common/models/requestUser.model';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  /**
   * Get all users
   */
  @ApiOkResponse({ description: 'Users found' })
  @ApiForbiddenResponse({ description: "User doesn't have permissions" })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    const users = await this.userService.findAll();
    return {
      data: users,
    };
  }

  /**
   * Get one user by id
   */
  @ApiOkResponse({ description: 'User found' })
  @ApiNotFoundResponse({ description: 'Searched user not found' })
  @ApiForbiddenResponse({ description: "User doesn't have permissions" })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiParam({ name: 'id', type: String })
  @Roles(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', MongoIdPipe) id: Types.ObjectId) {
    return {
      data: await this.userService.findOneById(id),
    };
  }

  /**
   * Delete one user by id
   */
  @ApiOkResponse({ description: 'User deleted' })
  @ApiNotFoundResponse({ description: 'Searched user not found' })
  @ApiForbiddenResponse({ description: "User doesn't have permissions" })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiParam({ name: 'id', type: String })
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteOne(@Param('id', MongoIdPipe) id: Types.ObjectId) {
    return {
      data: await this.userService.deleteOneById(id),
    };
  }

  /**
   * Update one user by id
   */
  @ApiOkResponse({ description: 'User updated' })
  @ApiNotFoundResponse({ description: 'Searched user not found' })
  @ApiBadRequestResponse({ description: 'Email or username already exists' })
  @ApiForbiddenResponse({ description: "User doesn't have permissions" })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiParam({ name: 'id', type: String })
  @Put(':id')
  async updateOne(
    @Param('id', MongoIdPipe) id: Types.ObjectId,
    @Body() body: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = req.user as RequestUser;

    return {
      data: await this.userService.updateOneById(id, body, user),
    };
  }

  /**
   * Update user role by id
   */
  @ApiOkResponse({ description: 'Role updated' })
  @ApiNotFoundResponse({ description: 'Searched user not found' })
  @ApiForbiddenResponse({ description: "User doesn't have permissions" })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiParam({ name: 'id', type: String })
  @Patch(':id/role')
  @Roles(Role.ADMIN)
  async updateRole(
    @Param('id', MongoIdPipe) id: Types.ObjectId,
    @Body() data: UpdateUserRoleDto,
  ) {
    return {
      data: await this.userService.updateRole(id, data.role),
    };
  }
}
