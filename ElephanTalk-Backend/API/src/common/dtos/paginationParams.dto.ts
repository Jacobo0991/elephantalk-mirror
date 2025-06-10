import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationParamsDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number;
}
