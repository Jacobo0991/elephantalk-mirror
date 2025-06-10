import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/models/roles.model';

export class CreateUserDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MinLength(4)
  readonly username: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  readonly lastname: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserRoleDto {
  @IsEnum(Role)
  @IsNotEmpty()
  readonly role: Role;
}
