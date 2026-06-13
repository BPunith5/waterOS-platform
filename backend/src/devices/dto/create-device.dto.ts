import { IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @MinLength(1)
  deviceName: string;

  @IsOptional()
  @IsMongoId()
  tankId?: string;
}
