import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'puneethbandlamudi@gmail.com' })
  @IsEmail()
  email: string;
}
