import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserDocument } from '../users/schemas/user.schema';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get aggregated analytics for the current user\'s fleet' })
  @ApiQuery({ name: 'range', required: false, enum: ['7D', '30D', '90D'], description: 'Time range (default 7D)' })
  @ApiQuery({ name: 'tankId', required: false, description: 'Filter to a specific tank (MongoDB ObjectId)' })
  @ApiResponse({ status: 200, description: 'Daily aggregates, uptime %, and fleet distribution by tank type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  get(@CurrentUser() user: UserDocument, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getAnalytics(user._id, query.range ?? '7D', query.tankId);
  }
}
