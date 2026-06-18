import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ALERT_SEVERITIES } from '../alert-thresholds';
import type { AlertSeverity } from '../alert-thresholds';

export class FindAlertsQueryDto {
  @ApiPropertyOptional({ enum: ALERT_SEVERITIES, example: 'warning', description: 'Filter alerts by severity level' })
  @IsOptional()
  @IsIn(ALERT_SEVERITIES)
  severity?: AlertSeverity;
}
