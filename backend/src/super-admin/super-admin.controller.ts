import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import type { UserDocument } from '../users/schemas/user.schema';
import { AssignDeviceDto } from './dto/assign-device.dto';
import { BatchProvisionDto } from './dto/batch-provision.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ProvisionDeviceDto } from './dto/provision-device.dto';
import { SuperAdminService } from './super-admin.service';

@ApiTags('super-admin')
@ApiBearerAuth('JWT')
@UseGuards(SuperAdminGuard)
@Controller('superadmin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  // ─── Admin Management ──────────────────────────────────────────────────────

  @Post('admins')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiResponse({ status: 201, description: 'Admin created' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.superAdminService.createAdmin(dto);
  }

  @Get('admins')
  @ApiOperation({ summary: 'List all admin users' })
  @ApiResponse({ status: 200, description: 'Array of admin users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  listAdmins() {
    return this.superAdminService.listAdmins();
  }

  @Delete('admins/:id')
  @ApiOperation({ summary: 'Deactivate (delete) an admin user' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the admin' })
  @ApiResponse({ status: 200, description: 'Admin deleted' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  deactivateAdmin(@Param('id') id: string) {
    return this.superAdminService.deactivateAdmin(id);
  }

  // ─── Device Management ─────────────────────────────────────────────────────

  @Post('devices')
  @ApiOperation({ summary: 'Provision a single device' })
  @ApiResponse({ status: 201, description: 'Device provisioned with unclaimed status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  provisionDevice(@CurrentUser() user: UserDocument, @Body() dto: ProvisionDeviceDto) {
    return this.superAdminService.provisionDevice(user._id, dto);
  }

  @Post('devices/batch')
  @ApiOperation({ summary: 'Batch provision multiple devices' })
  @ApiResponse({ status: 201, description: 'Devices provisioned; includes CSV string' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  batchProvision(@CurrentUser() user: UserDocument, @Body() dto: BatchProvisionDto) {
    return this.superAdminService.batchProvision(user._id, dto);
  }

  @Get('devices')
  @ApiOperation({ summary: 'List all devices (all users)' })
  @ApiResponse({ status: 200, description: 'Array of device documents with populated claimedBy and assignedAdminIds' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  listAllDevices() {
    return this.superAdminService.listAllDevices();
  }

  @Post('devices/:id/assign')
  @ApiOperation({ summary: 'Assign a device to an admin' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the device' })
  @ApiResponse({ status: 201, description: 'Device assigned to admin' })
  @ApiResponse({ status: 404, description: 'Device or admin not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  assignDevice(@Param('id') id: string, @Body() dto: AssignDeviceDto) {
    return this.superAdminService.assignDevice(id, dto.adminId);
  }

  @Delete('devices/:id/assign/:adminId')
  @ApiOperation({ summary: 'Unassign a device from an admin' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the device' })
  @ApiParam({ name: 'adminId', description: 'MongoDB ObjectId of the admin' })
  @ApiResponse({ status: 200, description: 'Admin unassigned from device' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  unassignDevice(@Param('id') id: string, @Param('adminId') adminId: string) {
    return this.superAdminService.unassignDevice(id, adminId);
  }

  // ─── User Management ───────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List all regular users' })
  @ApiResponse({ status: 200, description: 'Array of user documents' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  listAllUsers() {
    return this.superAdminService.listAllUsers();
  }

  // ─── Audit Log ─────────────────────────────────────────────────────────────

  @Get('audit')
  @ApiOperation({ summary: 'Get manual telemetry audit log' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max records (default 100)' })
  @ApiResponse({ status: 200, description: 'Array of manually pushed telemetry records with pushedBy populated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAuditLog(@Query('limit') limit?: string) {
    return this.superAdminService.getTelemetryAuditLog(limit ? parseInt(limit, 10) : 100);
  }

  // ─── Device Key Rotation ───────────────────────────────────────────────────

  @Post('devices/:id/rotate-code')
  @ApiOperation({ summary: 'Rotate registration code (only for unclaimed devices)' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the device' })
  @ApiResponse({ status: 201, description: 'New registration code generated' })
  @ApiResponse({ status: 403, description: 'Device is not unclaimed' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  rotateRegistrationCode(@Param('id') id: string) {
    return this.superAdminService.rotateRegistrationCode(id);
  }

  @Post('devices/:id/rotate-key')
  @ApiOperation({ summary: 'Rotate device secret key' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the device' })
  @ApiResponse({ status: 201, description: 'New secret key generated' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  rotateSecretKey(@Param('id') id: string) {
    return this.superAdminService.rotateSecretKey(id);
  }

  @Post('devices/:id/decommission')
  @ApiOperation({ summary: 'Decommission a device' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the device' })
  @ApiResponse({ status: 201, description: 'Device status set to decommissioned' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  decommissionDevice(@Param('id') id: string) {
    return this.superAdminService.decommissionDevice(id);
  }
}
