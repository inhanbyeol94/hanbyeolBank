import { Body, Controller, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountTypeDto } from '../_common/dtos/createAccountType.dto';
import { IMessage } from '../_common/interfaces/message.interface';
import { CreateAccountDto } from '../_common/dtos/createAccount.dto';
import { IAccountNumber } from '../_common/interfaces/accountNumber.interface';

@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('type')
  async createAccountType(@Body() newAccountType: CreateAccountTypeDto): Promise<IMessage> {
    return await this.accountService.createAccountType(newAccountType);
  }

  @Post()
  async createAccount(@Body() newAccount: CreateAccountDto): Promise<IAccountNumber> {
    return await this.accountService.createAccount(newAccount);
  }
}
