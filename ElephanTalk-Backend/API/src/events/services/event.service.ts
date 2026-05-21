import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    NotAcceptableException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from '../schemas/event.schema';
import { CreateEventDto, UpdateEventDto } from '../dtos/event.dto';
import { FilterQuery, Model, Types } from 'mongoose';
import { UsersService } from 'src/users/services/users.service';
import { PaginationParamsDto } from 'src/common/dtos/paginationParams.dto';
import { ToxicityDetectorService } from 'src/toxicity-detector/services/toxicity-detector.service';

export interface EventFilterParams {
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private readonly eventModel: Model<Event>,
        private readonly usersService: UsersService,
        private readonly toxicityDetectorService: ToxicityDetectorService,
    ) { }

    async create(userId: Types.ObjectId, data: CreateEventDto) {
        const resultTitle =
            await this.toxicityDetectorService.getToxicityClassification(
                data.title,
            );
        if (resultTitle.isToxic) throw new NotAcceptableException(resultTitle.tags);

        const resultDescription =
            await this.toxicityDetectorService.getToxicityClassification(
                data.description,
            );
        if (resultDescription.isToxic) throw new NotAcceptableException(resultDescription.tags);

        const newEvent = new this.eventModel({ ...data, user: userId });
        return await newEvent.save();
    }

    async findAll(
        paginationParams: PaginationParamsDto,
        filters: EventFilterParams,
        userId: Types.ObjectId,
    ) {
        const { limit = 20, page = 1 } = paginationParams;
        const { search, dateFrom, dateTo } = filters;

        const query: FilterQuery<Event> = { active: true };

        // Search filter — matches against title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // Date range filter
        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) query.date.$gte = dateFrom;
            if (dateTo) query.date.$lte = dateTo;
        }

        const skip = limit * (page - 1);
        const count = await this.eventModel.countDocuments(query);
        const pages = Math.ceil(count / limit);

        const events = await this.eventModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort({ date: 1 }) // soonest events first
            .populate('user', 'username name lastname picture')
            .populate('attendees', 'username name lastname picture');

        const eventsWithAttendanceFlag = events.map((event) => {
            const isAttending = event.attendees.some((a) => a._id.equals(userId));
            return { ...event.toObject(), isAttending };
        });

        return {
            data: eventsWithAttendanceFlag,
            pagination: {
                count,
                page,
                pages,
                limit,
            },
        };
    }

    async findOneById(id: Types.ObjectId, userId?: Types.ObjectId) {
        const event = await this.eventModel
            .findOne({ _id: id, active: true })
            .populate('user', '_id, username name lastname picture')
            .populate('attendees', '_id, username name lastname picture');

        if (!event) {
            throw new NotFoundException('Event not found.');
        }
        if (userId) {
            const isAttending = event.attendees.some((a) => a._id.equals(userId));
            return { ...event.toObject(), isAttending } as Event;
        } else {
            return { ...event.toObject() } as Event;
        }
    }

    async findAttending(
        userId: Types.ObjectId,
        paginationParams: PaginationParamsDto,
    ) {
        const { limit = 20, page = 1 } = paginationParams;
        const skip = limit * (page - 1);

        const query: FilterQuery<Event> = { attendees: userId, active: true };

        const count = await this.eventModel.countDocuments(query);
        const pages = Math.ceil(count / limit);

        const events = await this.eventModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort({ date: 1 })
            .populate('user', 'username name lastname picture')
            .populate('attendees', 'username name lastname picture');

        const eventsWithAttendanceFlag = events.map((event) => {
            const isAttending = event.attendees.some((a) => a._id.equals(userId));
            return { ...event.toObject(), isAttending };
        });

        return {
            data: eventsWithAttendanceFlag,
            pagination: {
                count,
                page,
                pages,
                limit,
            },
        };
    }

    async updateOneById(
        id: Types.ObjectId,
        changes: UpdateEventDto,
        userId: Types.ObjectId,
    ) {
        const event = await this.findOneById(id);
        if (!event) {
            throw new NotFoundException('Event not found.');
        }
        console.log(event);
        if (!event.user._id.equals(userId)) {
            throw new ForbiddenException('Forbidden to update this event.');
        }

        if (changes.title) {
            const resultTitle =
                await this.toxicityDetectorService.getToxicityClassification(
                    changes.title,
                );
            if (resultTitle.isToxic) throw new NotAcceptableException(resultTitle.tags);
        }

        if (changes.description) {
            const resultDescription =
                await this.toxicityDetectorService.getToxicityClassification(
                    changes.description,
                );
            if (resultDescription.isToxic) throw new NotAcceptableException(resultDescription.tags);
        }

        return this.eventModel
            .findByIdAndUpdate(
                id,
                { $set: { ...changes } },
                { new: true },
            )
            .select('title description date schedule location updatedAt -_id');
    }

    async deleteOneById(id: Types.ObjectId, userId: Types.ObjectId) {
        const event = await this.findOneById(id);

        if (!event.user._id.equals(userId)) {
            throw new ForbiddenException('Forbidden to delete this event.');
        }

        return this.eventModel.deleteOne({ _id: id });
    }

    async toggleActive(id: Types.ObjectId, userId: Types.ObjectId) {
        const event = await this.eventModel.findById(id);

        if (!event) {
            throw new NotFoundException('Event not found.');
        }
        if (event.user !== userId) {
            throw new ForbiddenException('Forbidden to update this event.');
        }

        return this.eventModel
            .findByIdAndUpdate(id, { $set: { active: !event.active } }, { new: true })
            .select('active -_id');
    }

    async findUpcoming(paginationParams: PaginationParamsDto) {
        const { limit = 20, page = 1 } = paginationParams;
        const skip = limit * (page - 1);

        const now = new Date();
        const query: FilterQuery<Event> = { active: true, date: { $gte: now } };

        const count = await this.eventModel.countDocuments(query);
        const pages = Math.ceil(count / limit);

        const events = await this.eventModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort({ date: 1 })
            .populate('user', 'username name lastname picture');

        return {
            data: events,
            pagination: {
                count,
                page,
                pages,
                limit,
            },
        };
    }

    async findByUser(
        targetUserId: Types.ObjectId,
        paginationParams: PaginationParamsDto,
    ) {
        const { limit = 20, page = 1 } = paginationParams;
        const skip = limit * (page - 1);

        const query: FilterQuery<Event> = { user: targetUserId, active: true };

        const count = await this.eventModel.countDocuments(query);
        const pages = Math.ceil(count / limit);

        const events = await this.eventModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort({ date: 1 })
            .populate('user', 'username name lastname picture');

        return {
            data: events,
            pagination: {
                count,
                page,
                pages,
                limit,
            },
        };
    }

    async toggleAttendance(id: Types.ObjectId, userId: Types.ObjectId) {
        const event = await this.findOneById(id);

        if (!event) {
            throw new NotFoundException('Event not found.');
        }

        if (!event.active) {
            throw new NotFoundException('Event not found.');
        }

        // Prevent marking attendance to past events
        if (event.date < new Date()) {
            throw new ForbiddenException('Cannot mark attendance to a past event.');
        }

        let { attendees } = event;
        const isAttending = attendees.some((a) => a.equals(userId));

        if (isAttending) {
            attendees = attendees.filter((a) => !a.equals(userId));
        } else {
            // Check capacity before adding
            if (event.capacity && attendees.length >= event.capacity) {
                throw new ForbiddenException('This event has reached its capacity.');
            }
            attendees.push(userId);
        }

        return this.eventModel
            .findByIdAndUpdate(id, { $set: { attendees } }, { new: true })
            .select('attendees capacity -_id');
    }
}