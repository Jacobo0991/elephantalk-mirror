import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/models/roles.model';
import { RequestUser } from 'src/common/models/requestUser.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(data: CreateUserDto) {
    const emailUser = await this.findOneByEmail(data.email);
    const usernameUser = await this.findOneByUsername(data.username);

    if (emailUser || usernameUser) {
      const messages = [];
      emailUser && messages.push('Email already exists.');
      usernameUser && messages.push('Username already exists.');
      throw new BadRequestException(messages);
    }

    const newUser = new this.userModel(data);

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(newUser.password, salt);
    newUser.password = hash;
    newUser.picture = `https://i.pravatar.cc/150?u=${newUser.username}`;

    const user = await newUser.save();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...withoutPassword } = user.toObject();

    return withoutPassword;
  }

  async findOneById(id: Types.ObjectId) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async findOneByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findOneByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  async findOneByUsernameOrEmail(usernameOrEmail: string) {
    return this.userModel
      .findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      })
      .select('+password');
  }

  findAll() {
    return this.userModel.find();
  }

  async findOwnProfile(id: Types.ObjectId) {
    const user = await this.findOneById(id);

    return {
      _id: user._id,
      username: user.username,
      picture: user.picture,
      name: user.name,
      lastname: user.lastname,
    };
  }

  async deleteOneById(id: Types.ObjectId) {
    await this.findOneById(id);

    return await this.userModel.deleteOne({ _id: id });
  }

  async updateOneById(
    id: Types.ObjectId,
    data: UpdateUserDto,
    currentUser: RequestUser,
  ) {
    const user = await this.findOneById(id);

    if (user._id != currentUser.id && currentUser.role != Role.ADMIN) {
      throw new ForbiddenException('You can only update your own user.');
    }

    const emailUser = await this.findOneByEmail(data.email);
    const usernameUser = await this.findOneByUsername(data.username);

    if (emailUser && emailUser.id != id) {
      throw new BadRequestException('Email already exists.');
    }

    if (usernameUser && usernameUser.id != id) {
      throw new BadRequestException('Username already exists.');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true },
    );

    return updatedUser;
  }

  async updateRole(id: Types.ObjectId, role: Role) {
    await this.findOneById(id);

    return this.userModel.findOneAndUpdate(
      { _id: id },
      { $set: { role } },
      { new: true },
    );
  }

  async toggleFavoritePost(userId: Types.ObjectId, postId: Types.ObjectId) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    let { favorites } = user;

    const isFavorite = favorites.includes(postId);

    if (isFavorite) {
      favorites = favorites.filter((id) => !id.equals(postId));
    } else {
      favorites.push(postId);
    }

    return this.userModel
      .findByIdAndUpdate(userId, { $set: { favorites } }, { new: true })
      .select('favorites -_id');
  }
}
