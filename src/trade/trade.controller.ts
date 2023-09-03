import { Body, Controller, Post } from '@nestjs/common';
import { TradeService } from './trade.service';
import { DirectDepositDataDto } from '../_common/dtos/directDepositData.dto';
import { DirectDepositDto } from '../_common/dtos/directDeposit.dto';
import { IMessage } from '../_common/interfaces/message.interface';
import { WithdrawalsDto } from '../_common/dtos/withdrawals.dto';

@Controller('trade')
export class TradeController {
  constructor(private tradeService: TradeService) {}

  @Post('deposit/without/passbook') /* 무통장 입금 */ async depositWithoutPassbook(@Body() directDepositData: DirectDepositDataDto): Promise<IMessage> {
    return await this.tradeService.depositWithoutPassbook(directDepositData);
  }

  @Post('direct/deposit') /* 계좌이체 */ async directDeposit(@Body() tradeData: DirectDepositDto): Promise<IMessage> {
    return await this.tradeService.directDeposit(tradeData);
  }

  @Post('withdrawals') /* 가상 출금 */ async withdrawals(@Body() tradeData: WithdrawalsDto): Promise<IMessage> {
    return await this.tradeService.withdrawals(tradeData);
  }
}
