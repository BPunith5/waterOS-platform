import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { SystemConfigService } from './system-config.service';
import { SetProtocolDto } from './dto/set-protocol.dto';

@ApiTags('system-config')
@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly service: SystemConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get global system config (public)' })
  getConfig() {
    return this.service.getConfig();
  }

  @Patch()
  @ApiBearerAuth('JWT')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Update telemetry protocol (super admin only)' })
  setProtocol(@Body() dto: SetProtocolDto) {
    return this.service.setProtocol(dto.telemetryProtocol);
  }
}
