import { Types } from 'mongoose';
import { Role } from 'src/common/models/roles.model';

export class TokenPayload {
  sub: Types.ObjectId;
  role: Role;
}
