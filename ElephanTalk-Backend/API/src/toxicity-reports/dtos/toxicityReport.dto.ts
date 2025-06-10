import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ReportType } from '../models/report-type.model';
import { Transform } from 'class-transformer';
import { ReportDecideAction } from '../models/report-status.model';
import { PaginationParamsDto } from 'src/common/dtos/paginationParams.dto';
import { OrderType } from 'src/common/models/order.model';

export class CreateToxicityReportDto {
  @IsString({ each: true })
  @Transform(({ value }) => value.map((tag: string) => tag.trim()))
  tags: string[];

  @IsEnum(ReportType)
  type: ReportType;

  @IsMongoId()
  reportedElementId: string;
}

export class DecideToxicityReportDto {
  @IsEnum(ReportDecideAction)
  status: ReportDecideAction;
}

export class GetToxicityReportsQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @IsOptional()
  @IsEnum(OrderType)
  order?: OrderType;
}
