import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProvisionDeviceDto {
  @ApiProperty({ example: 'Roof Tank Sensor A1' })
  @IsString()
  deviceName: string;

  @ApiPropertyOptional({ example: '64abc...' })
  @IsOptional()
  @IsString()
  adminId?: string;
}
