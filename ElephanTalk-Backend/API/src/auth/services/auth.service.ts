import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from 'src/users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from '../models/token.model';
import { Role } from 'src/common/models/roles.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(usernameOrEmail: string, password: string) {
    const user = await this.userService.findOneByUsernameOrEmail(
      usernameOrEmail,
    );

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    const token = await this.generateToken(user);

    return token;
  }

  async validateAdmin(usernameOrEmail: string, password: string) {
    const user = await this.userService.findOneByUsernameOrEmail(
      usernameOrEmail,
    );

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch || user.role !== Role.ADMIN) {
      return null;
    }

    const token = await this.generateToken(user);

    return token;
  }

  async generateToken(user: UserDocument) {
    const payload: TokenPayload = { sub: user._id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
