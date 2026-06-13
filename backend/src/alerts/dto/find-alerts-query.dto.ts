import { IsIn, IsOptional } from 'class-validator';
import { ALERT_SEVERITIES } from '../alert-thresholds';
import type { AlertSeverity } from '../alert-thresholds';

export class FindAlertsQueryDto {
  @IsOptional()
  @IsIn(ALERT_SEVERITIES)
  severity?: AlertSeverity;
}
