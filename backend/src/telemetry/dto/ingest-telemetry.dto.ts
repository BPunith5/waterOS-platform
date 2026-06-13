import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class IngestTelemetryDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  waterLevel: number;

  @IsOptional()
  @IsNumber()
  waterQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  dissolvedOxygen?: number;

  @IsOptional()
  @IsNumber()
  ph?: number;

  @IsOptional()
  @IsNumber()
  turbidity?: number;

  @IsOptional()
  @IsNumber()
  tds?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsNumber()
  speed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  battery?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  signal?: number;
}
