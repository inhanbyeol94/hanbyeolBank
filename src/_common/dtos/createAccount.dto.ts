import { IsNotEmpty, IsNumber, IsString, Matches, MATCHES, MaxLength, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsNotEmpty()
  @IsNumber()
  typeId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(4)
  @MinLength(4)
  @Matches(/^[0-9]+$/)
  password: string;
}
