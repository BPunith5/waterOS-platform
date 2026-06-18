import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'puneethbandlamudi@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'WaterOS@123' })
  @IsString()
  password: string;
}
