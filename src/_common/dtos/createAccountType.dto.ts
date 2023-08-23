import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAccountTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
