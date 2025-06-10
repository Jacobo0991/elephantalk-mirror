import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalAdminStrategy extends PassportStrategy(
  Strategy,
  'local-admin',
) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    if (!username || !password) {
      throw new UnauthorizedException('username and password are required.');
    }
    const admin = await this.authService.validateAdmin(username, password);

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return admin;
  }
}
