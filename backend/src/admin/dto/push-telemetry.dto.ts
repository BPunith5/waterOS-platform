import { IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminPushTelemetryDto {
  @ApiPropertyOptional({ example: 0.75, minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  waterLevel?: number;

  @ApiPropertyOptional({ example: 0.8, minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  dissolvedOxygen?: number;

  @ApiPropertyOptional({ example: 7.2, minimum: 0, maximum: 14 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  ph?: number;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  turbidity?: number;

  @ApiPropertyOptional({ example: 22, minimum: -10, maximum: 85 })
  @IsOptional()
  @IsNumber()
  @Min(-10)
  @Max(85)
  temperature?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  tds?: number;

  @ApiPropertyOptional({ example: 100, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  battery?: number;

  @ApiPropertyOptional({ example: 100, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  signal?: number;

  @ApiPropertyOptional({ example: 'Calibration after maintenance' })
  @IsOptional()
  @IsString()
  note?: string;
}
