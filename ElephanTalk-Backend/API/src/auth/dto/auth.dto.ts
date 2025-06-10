import { IsOptional, IsString } from 'class-validator';

export class AuthInfoDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
