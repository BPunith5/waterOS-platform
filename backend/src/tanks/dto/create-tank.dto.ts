import { IsIn, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { TANK_TYPES, type TankType } from '../schemas/tank.schema';

export class CreateTankDto {
  @IsString()
  @MinLength(1)
  tankName: string;

  @IsIn(TANK_TYPES)
  tankType: TankType;

  @IsNumber()
  @Min(0)
  capacity: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
