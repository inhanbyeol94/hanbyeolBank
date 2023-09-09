import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateClientDto {
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
  sequence: string;
}
