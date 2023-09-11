import { IsNotEmpty, IsNumber, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class BalanceinquiryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(5)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(14)
  @MaxLength(14)
  @Matches(/^\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])[-]\d{7}$/)
  residentRegistrationNumber: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  @MaxLength(13)
  @Matches(/^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(16)
  @MaxLength(16)
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(4)
  @MinLength(4)
  @Matches(/^[0-9]+$/)
  password: string;

  @IsNotEmpty()
  @IsString()
  sequence: string;
}
