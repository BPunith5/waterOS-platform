import { IsMongoId, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectDeviceDto {
  @ApiProperty({ example: 'WTR-A1B2C3D4E5F6G7H8', description: 'WTR-prefixed device ID shown after registration' })
  @IsString()
  @MinLength(1)
  deviceId: string;

  @ApiProperty({ example: '482913', description: '6-digit activation PIN shown after registration' })
  @IsString()
  @MinLength(1)
  activationPin: string;

  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d1', description: 'MongoDB ObjectId of the tank to link' })
  @IsMongoId()
  tankId: string;
}
