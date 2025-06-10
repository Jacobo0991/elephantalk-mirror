import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsUrl, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @MinLength(1)
  description: string;

  @IsUrl()
  image: string;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class CommentPostDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @MinLength(1)
  content: string;
}
