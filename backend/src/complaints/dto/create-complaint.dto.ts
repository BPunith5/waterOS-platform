import { IsString, MinLength, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComplaintDto {
  @ApiProperty({ example: 'Sensor offline for 2 days' })
  @IsString()
  @MinLength(3)
  subject: string;

  @ApiProperty({ example: 'The sensor has not reported any readings since yesterday morning.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional({ example: '64abc123...' })
  @IsOptional()
  @IsMongoId()
  tankId?: string;

  @ApiPropertyOptional({ example: '64abc456...' })
  @IsOptional()
  @IsMongoId()
  deviceMongoId?: string;
}
