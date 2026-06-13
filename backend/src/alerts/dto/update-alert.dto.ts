import { IsBoolean } from 'class-validator';

export class UpdateAlertDto {
  @IsBoolean()
  read: boolean;
}
