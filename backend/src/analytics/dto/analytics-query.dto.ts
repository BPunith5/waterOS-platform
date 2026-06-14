import { IsIn, IsMongoId, IsOptional } from 'class-validator';

export const ANALYTICS_RANGES = ['7D', '30D', '90D'] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export class AnalyticsQueryDto {
  @IsOptional()
  @IsIn(ANALYTICS_RANGES)
  range?: AnalyticsRange;

  @IsOptional()
  @IsMongoId()
  tankId?: string;
}
