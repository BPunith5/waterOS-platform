import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserDocument } from '../users/schemas/user.schema';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';
import { TelemetryService } from './telemetry.service';

@Controller('iot')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post(':deviceId')
  ingest(@Param('deviceId') deviceId: string, @Query('key') key: string | undefined, @Body() dto: IngestTelemetryDto) {
    return this.telemetryService.ingest(deviceId, key, dto);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get(':deviceId')
  getLogs(@CurrentUser() user: UserDocument, @Param('deviceId') deviceId: string, @Query('limit') limit?: string) {
    return this.telemetryService.getLogs(user._id, deviceId, limit ? parseInt(limit, 10) : 100);
  }
}
