import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from 'src/common/models/roles.model';
export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  lastname: string;

  @Prop({ required: true, trim: true })
  picture: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: Role.USER, enum: Role })
  role: Role;

  @Prop({ type: [Types.ObjectId], ref: 'Post', default: [] })
  favorites: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
