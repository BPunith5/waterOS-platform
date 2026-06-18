import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Punith B', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'punith@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MyPassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
