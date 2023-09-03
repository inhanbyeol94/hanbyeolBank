import { Module } from '@nestjs/common';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from '../_common/entities/trade.entity';
import { Log } from '../_common/entities/log.entity';
import { AccountService } from '../account/account.service';
import { Account } from '../_common/entities/account.entity';
import { AccountType } from '../_common/entities/accountType.entity';
import { Client } from '../_common/entities/client.entity';
import { ClientService } from '../client/client.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trade, Log, Account, AccountType, Client])],
  controllers: [TradeController],
  providers: [TradeService, AccountService, ClientService],
})
export class TradeModule {}
