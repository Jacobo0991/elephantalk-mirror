import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  image: string;

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

  @Prop({ required: false, trim: true})
  country: string;

  @Prop({ required: false, trim: true})
  city: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  manualReviewed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Comment', default: [] })
  comments: Types.ObjectId[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
