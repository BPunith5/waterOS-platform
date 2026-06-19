import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BatchProvisionDto {
  @ApiProperty({ example: 'Tank Sensor' })
  @IsString()
  namePrefix: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  count: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminId?: string;
}
