import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

import { Role } from '../models/roles.model';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
