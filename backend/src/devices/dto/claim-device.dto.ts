import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimDeviceDto {
  @ApiProperty({
    example: 'W7K2-M9PX-4R1N-HQ8B',
    description: '16-char registration code on the physical device',
  })
  @IsString()
  registrationCode: string;

  @ApiProperty({
    example: '64abc...',
    description: 'Tank ID to link this device to',
  })
  @IsString()
  tankId: string;
}
