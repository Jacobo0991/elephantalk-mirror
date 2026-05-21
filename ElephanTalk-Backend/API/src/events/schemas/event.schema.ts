import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, trim: true })
    description: string;

    @Prop({ required: true })
    date: Date;

    @Prop({
        type: {
            startTime: { type: String, required: true },
            endTime: { type: String, required: false },
        },
        required: true,
    })
    schedule: {
        startTime: string;
        endTime?: string;
    };


    @Prop({
        type: {
            lat: { type: Number },
            lng: { type: Number },
        },
        required: false,
    })
    location?: {
        lat: number;
        lng: number;
    };

    @Prop({ required: false, trim: true })
    country?: string;

    @Prop({ required: false, trim: true })
    city?: string;

    @Prop({ required: false, trim: true })
    address?: string;

    @Prop({ default: true })
    active: boolean;

    @Prop({ required: false })
    capacity?: number;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    attendees: Types.ObjectId[];
}

export const EventSchema = SchemaFactory.createForClass(Event);