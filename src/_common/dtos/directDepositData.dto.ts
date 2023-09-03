import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class DirectDepositDataDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(16)
  @MaxLength(16)
  accountNumber: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  requestName: string;

  @IsNotEmpty()
  @IsString()
  requestPhone: string;
}
