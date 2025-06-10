import { Types } from 'mongoose';
import { Role } from './roles.model';

export interface RequestUser {
  id: Types.ObjectId;
  role: Role;
}
