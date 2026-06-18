import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAlertDto {
  @ApiProperty({ example: true, description: 'Set to true to mark the alert as read' })
  @IsBoolean()
  read: boolean;
}
