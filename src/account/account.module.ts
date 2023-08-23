import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../_common/entities/account.entity';
import { AccountType } from '../_common/entities/accountType.entity';
import { ClientService } from '../client/client.service';
import { Client } from '../_common/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, AccountType, Client])],
  controllers: [AccountController],
  providers: [AccountService, ClientService],
})
export class AccountModule {}
