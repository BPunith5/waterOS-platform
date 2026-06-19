import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import type { UserDocument } from '../users/schemas/user.schema';
import { AdminService } from './admin.service';
import { AdminPushTelemetryDto } from './dto/push-telemetry.dto';

@ApiTags('admin')
@ApiBearerAuth('JWT')
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('devices')
  @ApiOperation({ summary: 'List devices assigned to this admin' })
  @ApiResponse({ status: 200, description: 'Array of assigned device documents' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires admin role' })
  getAssignedDevices(@CurrentUser() user: UserDocument) {
    return this.adminService.getAssignedDevices(user._id);
  }

  @Get('devices/:id/telemetry')
  @ApiOperation({ summary: 'Get telemetry logs for an assigned device' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the device' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records (default 50)' })
  @ApiResponse({ status: 200, description: 'Array of telemetry records' })
  @ApiResponse({ status: 403, description: 'Not assigned to this device' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDeviceTelemetry(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getDeviceTelemetry(user._id, id, limit ? parseInt(limit, 10) : 50);
  }

  @Get('devices/:id/analytics')
  @ApiOperation({ summary: 'Get analytics for an assigned device' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the device' })
  @ApiQuery({ name: 'range', required: false, enum: ['7D', '30D', '90D'], description: 'Time range (default 7D)' })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  @ApiResponse({ status: 403, description: 'Not assigned to this device' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDeviceAnalytics(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Query('range') range?: string,
  ) {
    return this.adminService.getDeviceAnalytics(user._id, id, range ?? '7D');
  }

  @Post('devices/:id/telemetry')
  @ApiOperation({ summary: 'Manually push telemetry for an assigned device' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the device' })
  @ApiResponse({ status: 201, description: 'Telemetry ingested with source:manual' })
  @ApiResponse({ status: 400, description: 'Invalid telemetry values' })
  @ApiResponse({ status: 403, description: 'Not assigned to this device' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  pushTelemetry(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: AdminPushTelemetryDto,
  ) {
    return this.adminService.pushTelemetry(user._id, id, dto);
  }

  @Post('devices/:id/rotate-key')
  @ApiOperation({ summary: 'Rotate secret key for an assigned device' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the device' })
  @ApiResponse({ status: 201, description: 'New secret key generated' })
  @ApiResponse({ status: 403, description: 'Not assigned to this device' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  rotateSecretKey(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    return this.adminService.rotateSecretKey(user._id, id);
  }
}
