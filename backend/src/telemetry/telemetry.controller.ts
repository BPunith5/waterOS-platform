import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserDocument } from '../users/schemas/user.schema';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';
import { TelemetryService } from './telemetry.service';

@ApiTags('telemetry')
@Controller('iot')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post(':deviceId')
  @ApiSecurity('DeviceKey')
  @ApiOperation({ summary: 'Ingest telemetry from an IoT device (no JWT — authenticates via device secret key)' })
  @ApiParam({ name: 'deviceId', description: 'WTR-prefixed device ID (e.g. WTR-ABC123...)' })
  @ApiQuery({ name: 'key', required: true, description: 'Per-device secret key (32-byte hex string)' })
  @ApiResponse({ status: 201, description: 'Telemetry saved; alerts evaluated; socket event emitted' })
  @ApiResponse({ status: 401, description: 'Invalid device ID or secret key' })
  ingest(@Param('deviceId') deviceId: string, @Query('key') key: string | undefined, @Body() dto: IngestTelemetryDto) {
    return this.telemetryService.ingest(deviceId, key, dto);
  }
}

@ApiTags('telemetry')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get(':deviceId')
  @ApiOperation({ summary: 'Fetch recent telemetry logs for a device' })
  @ApiParam({ name: 'deviceId', description: 'WTR-prefixed device ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return (default 100)' })
  @ApiResponse({ status: 200, description: 'Array of telemetry documents, newest first' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getLogs(@CurrentUser() user: UserDocument, @Param('deviceId') deviceId: string, @Query('limit') limit?: string) {
    return this.telemetryService.getLogs(user._id, deviceId, limit ? parseInt(limit, 10) : 100);
  }
}
