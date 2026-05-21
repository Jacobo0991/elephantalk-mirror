import { PartialType, IntersectionType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsString,
    IsOptional,
    IsObject,
    IsNumber,
    IsDate,
    IsEnum,
    IsInt,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos/paginationParams.dto';


export class LocationDto {
    @IsNumber()
    lat: number;

    @IsNumber()
    lng: number;
}

export class ScheduleDto {
    @IsString()
    startTime: string; // e.g. "14:00"

    @IsOptional()
    @IsString()
    endTime?: string; // e.g. "18:00"

}

export class CreateEventDto {
    @IsString()
    @Transform(({ value }) => value.trim())
    @MinLength(1)
    title: string;

    @IsString()
    @Transform(({ value }) => value.trim())
    @MinLength(1)
    description: string;

    @Type(() => Date)
    @IsDate()
    date: Date;

    @ValidateNested()
    @Type(() => ScheduleDto)
    schedule: ScheduleDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => LocationDto)
    location?: LocationDto;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    capacity?: number;
}

export class UpdateEventDto extends PartialType(CreateEventDto) { }

export class EventFilterDto extends PartialType(PaginationParamsDto) {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dateFrom?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dateTo?: Date;
}
