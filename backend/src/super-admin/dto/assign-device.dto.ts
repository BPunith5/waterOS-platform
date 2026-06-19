import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignDeviceDto {
  @ApiProperty({ example: '64abc...' })
  @IsString()
  adminId: string;
}
