import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { ToxicityReportsService } from '../services/toxicity-reports.service';
import {
  CreateToxicityReportDto,
  DecideToxicityReportDto,
  GetToxicityReportsQueryDto,
} from '../dtos/toxicityReport.dto';
import { MongoIdPipe } from 'src/common/pipes/mongo/mongo-id.pipe';
import { Types } from 'mongoose';
import { RequestUser } from 'src/common/models/requestUser.model';
import { Request } from 'express';
import { Role } from 'src/common/models/roles.model';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('toxicity-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('toxicity-reports')
export class ToxicityReportsController {
  constructor(
    private readonly toxicityReportsService: ToxicityReportsService,
  ) {}

  /**
   * Create a new toxicity report
   */
  @ApiCreatedResponse({ description: 'Report created' })
  @ApiNotFoundResponse({ description: 'Element not found' })
  @ApiConflictResponse({ description: 'Report already exists' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @Post()
  async create(@Body() body: CreateToxicityReportDto) {
    return {
      data: await this.toxicityReportsService.create(body),
    };
  }

  /**
   * Find all toxicity reports
   */
  @ApiOkResponse({ description: 'Toxicity reports found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @Roles(Role.ADMIN)
  @Get('history')
  async getHistory(@Query() query: GetToxicityReportsQueryDto) {
    return {
      data: await this.toxicityReportsService.findAll(query),
    };
  }

  /**
   * Find all pending toxicity reports
   */
  @ApiOkResponse({ description: 'Pending toxicity reports found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @Roles(Role.ADMIN)
  @Get('monitor')
  async getMonitor(@Query() query: GetToxicityReportsQueryDto) {
    return {
      data: await this.toxicityReportsService.findPending(query),
    };
  }

  /**
   * Find a toxicity report by id
   */
  @ApiOkResponse({ description: 'Toxicity report found' })
  @ApiNotFoundResponse({ description: 'Toxicity report not found' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiParam({ name: 'id', type: String })
  @Roles(Role.ADMIN)
  @Get(':id')
  async findById(@Param('id', MongoIdPipe) id: Types.ObjectId) {
    return {
      data: await this.toxicityReportsService.findOneById(id),
    };
  }

  /**
   * Take action on a toxicity report
   */
  @ApiOkResponse({ description: 'Action taken' })
  @ApiNotFoundResponse({ description: 'Toxicity report not found' })
  @ApiConflictResponse({ description: 'Report already decided' })
  @ApiUnauthorizedResponse({ description: "User aren't authenticated" })
  @ApiParam({ name: 'id', type: String })
  @Roles(Role.ADMIN)
  @Patch(':id/decide')
  async decide(
    @Req() req: Request,
    @Param('id', MongoIdPipe) reportId: Types.ObjectId,
    @Body() data: DecideToxicityReportDto,
  ) {
    const { id } = req.user as RequestUser;

    return {
      data: await this.toxicityReportsService.decide(reportId, id, data),
    };
  }
}
