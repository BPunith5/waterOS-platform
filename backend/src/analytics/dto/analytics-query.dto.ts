import { IsIn, IsMongoId, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const ANALYTICS_RANGES = ['7D', '30D', '90D'] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ enum: ANALYTICS_RANGES, example: '7D', description: 'Time range for aggregation (default 7D)' })
  @IsOptional()
  @IsIn(ANALYTICS_RANGES)
  range?: AnalyticsRange;

  @ApiPropertyOptional({ example: '64f1a2b3c4d5e6f7a8b9c0d1', description: 'Filter analytics to a specific tank' })
  @IsOptional()
  @IsMongoId()
  tankId?: string;
}
