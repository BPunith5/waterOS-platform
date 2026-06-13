import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserDocument } from '../users/schemas/user.schema';
import { ConnectDeviceDto } from './dto/connect-device.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesService } from './devices.service';

@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  register(@CurrentUser() user: UserDocument, @Body() dto: CreateDeviceDto) {
    return this.devicesService.register(user._id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: UserDocument) {
    return this.devicesService.findAllForUser(user._id);
  }

  @Post('connect')
  connect(@CurrentUser() user: UserDocument, @Body() dto: ConnectDeviceDto) {
    return this.devicesService.connectToTank(user._id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    return this.devicesService.findOne(user._id, id);
  }

  @Put(':id')
  update(@CurrentUser() user: UserDocument, @Param('id') id: string, @Body() dto: UpdateDeviceDto) {
    return this.devicesService.update(user._id, id, dto);
  }
}
