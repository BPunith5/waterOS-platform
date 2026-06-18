import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IngestTelemetryDto {
  @ApiProperty({ example: 0.72, minimum: 0, maximum: 1, description: 'Water level as a fraction (0 = empty, 1 = full)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  waterLevel: number;

  @ApiPropertyOptional({ example: 3600, description: 'Water quantity in litres' })
  @IsOptional()
  @IsNumber()
  waterQuantity?: number;

  @ApiPropertyOptional({ example: 0.85, minimum: 0, maximum: 1, description: 'Dissolved oxygen saturation (0–1)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  dissolvedOxygen?: number;

  @ApiPropertyOptional({ example: 7.2, description: 'pH value (typical range 0–14)' })
  @IsOptional()
  @IsNumber()
  ph?: number;

  @ApiPropertyOptional({ example: 1.4, description: 'Turbidity in NTU' })
  @IsOptional()
  @IsNumber()
  turbidity?: number;

  @ApiPropertyOptional({ example: 320, description: 'Total dissolved solids in ppm' })
  @IsOptional()
  @IsNumber()
  tds?: number;

  @ApiPropertyOptional({ example: 24.5, description: 'Water temperature in °C' })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ example: 17.385, description: 'GPS latitude' })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 78.4867, description: 'GPS longitude' })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ example: 0, description: 'Speed in km/h (for mobile tanks)' })
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional({ example: 87, minimum: 0, maximum: 100, description: 'Battery percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  battery?: number;

  @ApiPropertyOptional({ example: 72, minimum: 0, maximum: 100, description: 'Signal strength percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  signal?: number;
}
