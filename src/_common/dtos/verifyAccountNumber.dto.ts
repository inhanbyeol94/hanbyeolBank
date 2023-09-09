import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyAccountNumberDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(16)
  @MaxLength(16)
  accountNumber: string;
}
