import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsObject, IsNumber, IsUrl, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class CreatePostDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @MinLength(1)
  description: string;

  @IsUrl()
  image: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  city: string;

}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class CommentPostDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @MinLength(1)
  content: string;
}
