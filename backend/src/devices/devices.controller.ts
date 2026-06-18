import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserDocument } from '../users/schemas/user.schema';
import { ConnectDeviceDto } from './dto/connect-device.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesService } from './devices.service';

@ApiTags('devices')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new device — returns deviceId, activationPin, secretKey, qrCode' })
  @ApiResponse({ status: 201, description: 'Device registered with pending status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  register(@CurrentUser() user: UserDocument, @Body() dto: CreateDeviceDto) {
    return this.devicesService.register(user._id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all devices owned by the current user' })
  @ApiResponse({ status: 200, description: 'Array of device documents' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: UserDocument) {
    return this.devicesService.findAllForUser(user._id);
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect a device to a tank using deviceId + activationPin' })
  @ApiResponse({ status: 201, description: 'Device status set to active, simulation started' })
  @ApiResponse({ status: 400, description: 'Invalid deviceId or activationPin' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  connect(@CurrentUser() user: UserDocument, @Body() dto: ConnectDeviceDto) {
    return this.devicesService.connectToTank(user._id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single device by MongoDB ObjectId' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the device' })
  @ApiResponse({ status: 200, description: 'Device document' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    return this.devicesService.findOne(user._id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update device name or linked tank' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the device' })
  @ApiResponse({ status: 200, description: 'Updated device document' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@CurrentUser() user: UserDocument, @Param('id') id: string, @Body() dto: UpdateDeviceDto) {
    return this.devicesService.update(user._id, id, dto);
  }
}
