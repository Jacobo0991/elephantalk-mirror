import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentPostDto, CreatePostDto, UpdatePostDto } from '../dtos/post.dto';
import { Request } from 'express';
import { PostService } from '../services/posts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RequestUser } from 'src/common/models/requestUser.model';
import { MongoIdPipe } from 'src/common/pipes/mongo/mongo-id.pipe';
import { Types } from 'mongoose';
import { PaginationParamsDto } from 'src/common/dtos/paginationParams.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from 'src/common/models/roles.model';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * Create a new post
   */
  @ApiCreatedResponse({ description: 'Post created' })
  @ApiBadRequestResponse({ description: 'Invalid create data' })
  @ApiNotAcceptableResponse({ description: 'Post is toxic' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @Post()
  async create(@Body() body: CreatePostDto, @Req() req: Request) {
    const { id } = req.user as RequestUser;

    return {
      data: await this.postService.create(id, body),
    };
  }

  /**
   * Find all available posts
   */
  @ApiOkResponse({ description: 'Available posts found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @Get()
  async findAllAvailable(
    @Req() req: Request,
    @Query() query: PaginationParamsDto,
  ) {
    const { id } = req.user as RequestUser;

    return await this.postService.findAll(query, { active: true }, id);
  }

  /**
   * Find all posts
   */
  @ApiOkResponse({ description: 'Posts found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiForbiddenResponse({ description: "User doesn't have permissions" })
  @Roles(Role.ADMIN)
  @Get('all')
  async findAll(@Req() req: Request, @Query() query: PaginationParamsDto) {
    const { id } = req.user as RequestUser;

    return await this.postService.findAll(query, {}, id);
  }

  /**
   * Find all posts owned by the user
   */
  @ApiOkResponse({ description: 'Owned posts found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @Get('owned')
  async findAllOwned(@Req() req: Request, @Query() query: PaginationParamsDto) {
    const { id } = req.user as RequestUser;

    return await this.postService.findAll(query, { user: id }, id);
  }

  /**
   * Find all posts liked by the user
   */

  @ApiOkResponse({ description: 'Available posts found' })
  @ApiNotFoundResponse({ description: 'Searched user not found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @Get('favorites')
  async findAllFavorites(
    @Req() req: Request,
    @Query() query: PaginationParamsDto,
  ) {
    const { id } = req.user as RequestUser;

    return await this.postService.findAllFavorites(id, query);
  }

  /**
   * Find a post by id
   */
  @ApiOkResponse({ description: 'Post found' })
  @ApiNotFoundResponse({ description: 'Searched post not found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  async findOne(
    @Req() req: Request,
    @Param('id', MongoIdPipe) id: Types.ObjectId,
  ) {
    const user = req.user as RequestUser;

    return {
      data: await this.postService.findOneById(id, user.id),
    };
  }

  /**
   * Update a post
   */
  @ApiOkResponse({ description: 'Post updated' })
  @ApiNotFoundResponse({ description: 'Searched post not found' })
  @ApiBadRequestResponse({ description: 'Invalid update data' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiForbiddenResponse({ description: "User doesn't have permissions" })
  @ApiParam({ name: 'id', type: String })
  @Put(':id')
  async updateOne(
    @Req() req: Request,
    @Param('id', MongoIdPipe) id: Types.ObjectId,
    @Body() body: UpdatePostDto,
  ) {
    const user = req.user as RequestUser;

    return {
      data: await this.postService.updateOneById(id, body, user.id),
    };
  }

  /**
   * Delete a post
   */
  @ApiOkResponse({ description: 'Post deleted' })
  @ApiNotFoundResponse({ description: 'Searched post not found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiForbiddenResponse({ description: "User doesn't have permissions" })
  @ApiParam({ name: 'id', type: String })
  @Delete(':id')
  async deleteOne(
    @Req() req: Request,
    @Param('id', MongoIdPipe) id: Types.ObjectId,
  ) {
    const user = req.user as RequestUser;

    return {
      data: await this.postService.deleteOneById(id, user.id),
    };
  }

  /**
   * Set active or inactive a post
   */
  @ApiOkResponse({ description: 'Post active property updated' })
  @ApiNotFoundResponse({ description: 'Searched post not found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiForbiddenResponse({ description: "User doesn't have permissions" })
  @ApiParam({ name: 'id', type: String })
  @Patch(':id/active')
  async toggleActive(
    @Req() req: Request,
    @Param('id', MongoIdPipe) id: Types.ObjectId,
  ) {
    const user = req.user as RequestUser;

    return {
      data: await this.postService.toggleActive(id, user.id),
    };
  }

  /**
   * Like or dislike a post
   */
  @ApiOkResponse({ description: 'Post liked or disliked' })
  @ApiNotFoundResponse({ description: 'Searched post not found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiParam({ name: 'id', type: String })
  @Patch(':id/like')
  async toggleLike(
    @Req() req: Request,
    @Param('id', MongoIdPipe) id: Types.ObjectId,
  ) {
    const user = req.user as RequestUser;

    return {
      data: await this.postService.toggleLike(id, user.id),
    };
  }

  /**
   * Add a comment to a post
   */
  @ApiOkResponse({ description: 'Post commented' })
  @ApiNotFoundResponse({ description: 'Searched post not found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiParam({ name: 'id', type: String })
  @Post(':id/comment')
  async addComment(
    @Req() req: Request,
    @Param('id', MongoIdPipe) id: Types.ObjectId,
    @Body() comment: CommentPostDto,
  ) {
    const user = req.user as RequestUser;

    return {
      data: await this.postService.addComment(id, user.id, comment),
    };
  }

  /**
   * Delete a comment from a post
   */
  @ApiOkResponse({ description: 'Comment deleted' })
  @ApiNotFoundResponse({ description: 'Searched post or comment not found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiForbiddenResponse({ description: "User doesn't have permissions" })
  @ApiParam({ name: 'id', type: String })
  @Delete(':id/comment')
  async deleteComment(
    @Req() req: Request,
    @Param('id', MongoIdPipe) id: Types.ObjectId,
  ) {
    const user = req.user as RequestUser;

    return {
      data: await this.postService.deleteComment(id, user.id),
    };
  }

  /**
   * Add or remove a post from favorites
   */
  @ApiOkResponse({ description: 'Post commented' })
  @ApiNotFoundResponse({
    description: 'Searched post or current user not found',
  })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiParam({ name: 'id', type: String })
  @Patch(':id/favorite')
  async toggleFavorite(
    @Req() req: Request,
    @Param('id', MongoIdPipe) id: Types.ObjectId,
  ) {
    const user = req.user as RequestUser;

    return {
      data: await this.postService.toggleFavorite(user.id, id),
    };
  }
}
