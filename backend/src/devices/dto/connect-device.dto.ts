import { IsMongoId, IsString, MinLength } from 'class-validator';

export class ConnectDeviceDto {
  @IsString()
  @MinLength(1)
  deviceId: string;

  @IsString()
  @MinLength(1)
  activationPin: string;

  @IsMongoId()
  tankId: string;
}
