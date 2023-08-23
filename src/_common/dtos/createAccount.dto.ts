import { IsNotEmpty, IsNumber, IsString, Matches, MATCHES, MaxLength, MinLength } from 'class-validator';
import { CreateClientDto } from './createClient.dto';

export class CreateAccountDto extends CreateClientDto {
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
