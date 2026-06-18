import { IsIn, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TANK_TYPES, type TankType } from '../schemas/tank.schema';

export class CreateTankDto {
  @ApiProperty({ example: 'Main Drinking Tank' })
  @IsString()
  @MinLength(1)
  tankName: string;

  @ApiProperty({ enum: TANK_TYPES, example: 'drinking' })
  @IsIn(TANK_TYPES)
  tankType: TankType;

  @ApiProperty({ example: 5000, description: 'Capacity in litres' })
  @IsNumber()
  @Min(0)
  capacity: number;

  @ApiPropertyOptional({ example: 'Hyderabad, Telangana' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Primary water supply for the household' })
  @IsOptional()
  @IsString()
  description?: string;
}
