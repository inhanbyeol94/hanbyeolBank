import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class DirectDepositDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(5)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  @MaxLength(13)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(14)
  @MaxLength(14)
  residentRegistrationNumber: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(16)
  @MaxLength(16)
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4)
  @MinLength(4)
  password: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(16)
  @MaxLength(16)
  requestAccountNubmer: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5)
  requestName: string;

  @IsNotEmpty()
  @IsNumber()
  sequence: number;
}
