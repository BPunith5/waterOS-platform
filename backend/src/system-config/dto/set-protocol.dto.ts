import { IsEnum } from 'class-validator';

export class SetProtocolDto {
  @IsEnum(['mqtt', 'http'])
  telemetryProtocol: 'mqtt' | 'http';
}
