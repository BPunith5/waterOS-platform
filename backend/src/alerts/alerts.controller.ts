import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserDocument } from '../users/schemas/user.schema';
import { AlertsService } from './alerts.service';
import { FindAlertsQueryDto } from './dto/find-alerts-query.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@ApiTags('alerts')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List alerts for the current user, optionally filtered by severity' })
  @ApiQuery({ name: 'severity', required: false, enum: ['info', 'warning', 'critical'], description: 'Filter by severity level' })
  @ApiResponse({ status: 200, description: 'Array of alert documents, newest first' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: UserDocument, @Query() query: FindAlertsQueryDto) {
    return this.alertsService.findAllForUser(user._id, query.severity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mark an alert as read' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the alert' })
  @ApiResponse({ status: 200, description: 'Updated alert document' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@CurrentUser() user: UserDocument, @Param('id') id: string, @Body() dto: UpdateAlertDto) {
    return this.alertsService.markRead(user._id, id, dto.read);
  }
}
