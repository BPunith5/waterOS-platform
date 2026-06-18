import { IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({ example: 'Sensor A — Rooftop Tank' })
  @IsString()
  @MinLength(1)
  deviceName: string;

  @ApiPropertyOptional({ example: '64f1a2b3c4d5e6f7a8b9c0d1', description: 'MongoDB ObjectId — pre-link to a tank at registration time (optional)' })
  @IsOptional()
  @IsMongoId()
  tankId?: string;
}
