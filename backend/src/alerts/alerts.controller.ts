import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserDocument } from '../users/schemas/user.schema';
import { AlertsService } from './alerts.service';
import { FindAlertsQueryDto } from './dto/find-alerts-query.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(@CurrentUser() user: UserDocument, @Query() query: FindAlertsQueryDto) {
    return this.alertsService.findAllForUser(user._id, query.severity);
  }

  @Patch(':id')
  update(@CurrentUser() user: UserDocument, @Param('id') id: string, @Body() dto: UpdateAlertDto) {
    return this.alertsService.markRead(user._id, id, dto.read);
  }
}
