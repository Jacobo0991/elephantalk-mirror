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
import { CreateEventDto, UpdateEventDto, EventFilterDto } from '../dtos/event.dto';
import { Request } from 'express';
import { EventService } from '../services/event.service';
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
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from 'src/common/models/roles.model';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    /**
     * Create a new event
     */
    @ApiCreatedResponse({ description: 'Event created' })
    @ApiBadRequestResponse({ description: 'Invalid create data' })
    @ApiUnauthorizedResponse({ description: "User isn't authenticated" })
    @Post()
    async create(@Body() body: CreateEventDto, @Req() req: Request) {
        const { id } = req.user as RequestUser;

        return {
            data: await this.eventService.create(id, body),
        };
    }

    /**
     * Find all active events — supports search and date range filters
     */
    @ApiOkResponse({ description: 'Active events found' })
    @ApiUnauthorizedResponse({ description: "User isn't authenticated" })
    @Get()
    async findAllAvailable(
        @Req() req: Request,
        @Query() filter: EventFilterDto
    ) {
        const { id } = req.user as RequestUser;

        return await this.eventService.findAll(filter as PaginationParamsDto, filter, id);
    }

    /**
     * Find all events (admin only)
     */
    @ApiOkResponse({ description: 'All events found' })
    @ApiUnauthorizedResponse({ description: "User isn't authenticated" })
    @ApiForbiddenResponse({ description: "User doesn't have permissions" })
    @Roles(Role.ADMIN)
    @Get('all')
    async findAll(
        @Req() req: Request,
        @Query() query: EventFilterDto,
    ) {
        const { id } = req.user as RequestUser;
        return await this.eventService.findAll(query as PaginationParamsDto, query, id);
    }

    /**
     * Find all upcoming events
     */
    @ApiOkResponse({ description: 'Upcoming events found' })
    @ApiUnauthorizedResponse({ description: "User isn't authenticated" })
    @Get('upcoming')
    async findUpcoming(
        @Req() req: Request,
        @Query() pagination: PaginationParamsDto,
    ) {
        const { id } = req.user as RequestUser;

        return await this.eventService.findUpcoming(pagination);
    }

    /**
     * Find all events owned by the current user
     */
    @ApiOkResponse({ description: 'Owned events found' })
    @ApiUnauthorizedResponse({ description: "User isn't authenticated" })
    @Get('owned')
    async findOwned(
        @Req() req: Request,
        @Query() pagination: PaginationParamsDto,
    ) {
        const { id } = req.user as RequestUser;

        return await this.eventService.findByUser(id, pagination);
    }

    /**
     * Find all events the current user is attending
     */
    @ApiOkResponse({ description: 'Attending events found' })
    @ApiUnauthorizedResponse({ description: "User isn't authenticated" })
    @Get('attending')
    async findAttending(
        @Req() req: Request,
        @Query() pagination: PaginationParamsDto,
    ) {
        const { id } = req.user as RequestUser;

        return await this.eventService.findAttending(id, pagination);
    }

    /**
     * Find events by a specific user
     */
    @ApiOkResponse({ description: 'User events found' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiUnauthorizedResponse({ description: "User isn't authenticated" })
    @ApiParam({ name: 'userId', type: String })
    @Get('user/:userId')
    async findByUser(
        @Req() req: Request,
        @Param('userId', MongoIdPipe) userId: Types.ObjectId,
        @Query() pagination: PaginationParamsDto,
    ) {

        return await this.eventService.findByUser(userId, pagination);
    }

    /**
     * Find an event by id
     */
    @ApiOkResponse({ description: 'Event found' })
    @ApiNotFoundResponse({ description: 'Event not found' })
    @ApiUnauthorizedResponse({ description: "User isn't authenticated" })
    @ApiParam({ name: 'id', type: String })
    @Get(':id')
    async findOne(
        @Req() req: Request,
        @Param('id', MongoIdPipe) id: Types.ObjectId,
    ) {
        const { id: userId } = req.user as RequestUser;

        return {
            data: await this.eventService.findOneById(id, userId),
        };
    }

    /**
     * Update an event
     */
    @ApiOkResponse({ description: 'Event updated' })
    @ApiNotFoundResponse({ description: 'Event not found' })
    @ApiBadRequestResponse({ description: 'Invalid update data' })
    @ApiUnauthorizedResponse({ description: "User isn't authenticated" })
    @ApiForbiddenResponse({ description: "User doesn't have permissions" })
    @ApiParam({ name: 'id', type: String })
    @Put(':id')
    async updateOne(
        @Req() req: Request,
        @Param('id', MongoIdPipe) id: Types.ObjectId,
        @Body() body: UpdateEventDto,
    ) {
        const user = req.user as RequestUser;

        return {
            data: await this.eventService.updateOneById(id, body, user.id),
        };
    }

    /**
     * Delete an event
     */
    @ApiOkResponse({ description: 'Event deleted' })
    @ApiNotFoundResponse({ description: 'Event not found' })
    @ApiUnauthorizedResponse({ description: "User isn't authenticated" })
    @ApiForbiddenResponse({ description: "User doesn't have permissions" })
    @ApiParam({ name: 'id', type: String })
    @Delete(':id')
    async deleteOne(
        @Req() req: Request,
        @Param('id', MongoIdPipe) id: Types.ObjectId,
    ) {
        const { id: userId } = req.user as RequestUser;

        return {
            data: await this.eventService.deleteOneById(id, userId),
        };
    }

    /**
     * Set active or inactive an event
     */
    @ApiOkResponse({ description: 'Event active property updated' })
    @ApiNotFoundResponse({ description: 'Event not found' })
    @ApiUnauthorizedResponse({ description: "User isn't authenticated" })
    @ApiForbiddenResponse({ description: "User doesn't have permissions" })
    @ApiParam({ name: 'id', type: String })
    @Patch(':id/active')
    async toggleActive(
        @Req() req: Request,
        @Param('id', MongoIdPipe) id: Types.ObjectId,
    ) {
        const { id: userId } = req.user as RequestUser;

        return {
            data: await this.eventService.toggleActive(id, userId),
        };
    }

    /**
     * Mark or unmark attendance to an event
     */
    @ApiOkResponse({ description: 'Attendance toggled' })
    @ApiNotFoundResponse({ description: 'Event not found' })
    @ApiForbiddenResponse({ description: 'Event is full or already past' })
    @ApiUnauthorizedResponse({ description: "User isn't authenticated" })
    @ApiParam({ name: 'id', type: String })
    @Patch(':id/attendance')
    async toggleAttendance(
        @Req() req: Request,
        @Param('id', MongoIdPipe) id: Types.ObjectId,
    ) {
        const { id: userId } = req.user as RequestUser;

        return {
            data: await this.eventService.toggleAttendance(id, userId),
        };
    }
}