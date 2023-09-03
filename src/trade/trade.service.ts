import { HttpException, Inject, Injectable } from '@nestjs/common';
import { DirectDepositDataDto } from '../_common/dtos/directDepositData.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Trade } from '../_common/entities/trade.entity';
import { DataSource, Repository } from 'typeorm';
import { Log } from '../_common/entities/log.entity';
import { InterpretingAccountNumber } from '../_common/utils/accountNumber.interpreting';
import { AccountService } from '../account/account.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IMessage } from '../_common/interfaces/message.interface';
import { IClientVerifyIdentity } from '../_common/interfaces/clientVerifyIdentity.interface';
import { DirectDepositDto } from '../_common/dtos/directDeposit.dto';
import { WithdrawalsDto } from '../_common/dtos/withdrawals.dto';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Trade) private tradeRepository: Repository<Trade>,
    @InjectRepository(Log) private logRepository: Repository<Log>,
    private accountService: AccountService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private dataSource: DataSource,
  ) {}

  /* 무통장 입금 */
  async depositWithoutPassbook(directDepositData: DirectDepositDataDto): Promise<IMessage> {
    /* 계좌번호, 예금주 검증 */
    const { verify, data } = await this.accountService.verifyAndFindAccount(directDepositData.accountNumber);
    if (!verify) throw new HttpException('계좌번호와 예금주명을 확인해주세요.', 403);

    /* 입금 트랜젝션 */
    await this.dataSource.transaction(async (manager) => {
      const createTrade = await manager.create(Trade, { account: { id: data.id }, status: 1, amount: directDepositData.amount });
      const saveTrade = await manager.save(Trade, createTrade);

      const createLog = await manager.create(Log, {
        trade: { id: saveTrade.id },
        status: 1,
        context: `[무통장 입금] ${directDepositData.requestName} / ${directDepositData.requestPhone}`,
        result: true,
        createdAt: saveTrade.createdAt,
      });
      await manager.save(createLog);
    });

    return { message: '무통장 입금이 완료되었습니다.' };
  }

  /* 계좌이체 */
  async directDeposit(tradeData: DirectDepositDto): Promise<IMessage> {
    /* 캐시메모리 호출 */
    const findByVerifyData: IClientVerifyIdentity = await this.cacheManager.get(tradeData.phone);

    /* 인증 데이터가 없을 경우 예외 반환 */
    if (!findByVerifyData || findByVerifyData.verify !== true) throw new HttpException('핸드폰 인증이 완료되지 않았습니다.', 403);

    /* 인증 데이터 내부의 'type, sequence'가 일치하지 않을 경우 어뷰징 유저 의심으로 인해 인증캐시 삭제 및 예외 반환 */
    if (+findByVerifyData.sequence !== tradeData.sequence || findByVerifyData.type !== 106) {
      await this.cacheManager.del(tradeData.phone);
      throw new HttpException('핸드폰 인증이 완료되지 않았습니다.', 403);
    }

    /* 본인 예금계좌 검증을 위해 캐시 메모리 'Type' 변경 */
    await this.cacheManager.set(tradeData.phone, { ...findByVerifyData, type: 105 });

    /* 본인 예금계좌 검증 */
    await this.accountService.verifyIdentityAndAccount(tradeData);

    /* 상대방 계좌번호 검증 */
    await this.accountService.verifyAccountNumber({ accountNumber: tradeData.requestAccountNubmer, name: tradeData.requestName });

    /* 통장 잔여금액 호출 */
    const currentAmount = await this.accountBalance(tradeData.accountNumber);

    /* 잔여금액 부족 검증 */
    if (tradeData.amount > currentAmount) throw new HttpException('통장 잔여금액 부족', 403);

    /* 예금계좌 ID 추출 */
    const { id: reqId } = InterpretingAccountNumber(tradeData.accountNumber);
    const { id: resId } = InterpretingAccountNumber(tradeData.requestAccountNubmer);

    /* 거래 트렌젝션 */
    await this.dataSource.transaction(async (manager) => {
      const createWithdrawals = await manager.create(Trade, { account: { id: reqId }, status: 0, amount: tradeData.amount });
      const resultWithdrawals = await manager.save(Trade, createWithdrawals);

      const createWithdrawalsLog = await manager.create(Log, {
        trade: { id: resultWithdrawals.id },
        status: resultWithdrawals.status,
        context: `[계좌이체/출금] ${tradeData.requestAccountNubmer} / ${tradeData.requestName}`,
        result: true,
      });
      await manager.save(Log, createWithdrawalsLog);

      const createDeposits = await manager.create(Trade, { account: { id: resId }, status: 1, amount: tradeData.amount });
      const resultDeposits = await manager.save(Trade, createDeposits);

      const createDepositsLog = await manager.create(Log, {
        trade: { id: resultDeposits.id },
        status: resultDeposits.status,
        context: `[계좌이체/입금] ${tradeData.accountNumber} / ${tradeData.name}`,
        result: true,
      });
      await manager.save(Log, createDepositsLog);
    });

    await this.cacheManager.del(tradeData.phone);
    return { message: '계좌이체가 정상 완료되었습니다.' };
  }

  /* 계좌 잔여금액 확인 */
  async accountBalance(accountNumber: string): Promise<number> {
    const { id } = InterpretingAccountNumber(accountNumber);
    const amountPlus = await this.tradeRepository.sum('amount', { account: { id }, status: 1 });
    const amountMinus = await this.tradeRepository.sum('amount', { account: { id }, status: 0 });
    return amountPlus - amountMinus;
  }

  /* 가상 출금 */
  async withdrawals(tradeData: WithdrawalsDto): Promise<IMessage> {
    /* 캐시메모리 호출 */
    const findByVerifyData: IClientVerifyIdentity = await this.cacheManager.get(tradeData.phone);

    /* 인증 데이터가 없을 경우 예외 반환 */
    if (!findByVerifyData || findByVerifyData.verify !== true) throw new HttpException('핸드폰 인증이 완료되지 않았습니다.', 403);

    /* 인증 데이터 내부의 'type, sequence'가 일치하지 않을 경우 어뷰징 유저 의심으로 인해 인증캐시 삭제 및 예외 반환 */
    if (+findByVerifyData.sequence !== tradeData.sequence || findByVerifyData.type !== 107) {
      await this.cacheManager.del(tradeData.phone);
      throw new HttpException('핸드폰 인증이 완료되지 않았습니다.', 403);
    }

    /* 본인 예금계좌 검증을 위해 캐시 메모리 'Type' 변경 */
    await this.cacheManager.set(tradeData.phone, { ...findByVerifyData, type: 105 });

    /* 본인 예금계좌 검증 */
    await this.accountService.verifyIdentityAndAccount(tradeData);

    /* 통장 잔여금액 호출 */
    const currentAmount = await this.accountBalance(tradeData.accountNumber);

    /* 잔여금액 부족 검증 */
    if (tradeData.amount > currentAmount) throw new HttpException('통장 잔여금액 부족', 403);

    /* 예금계좌 ID 추출 */
    const { id: reqId } = InterpretingAccountNumber(tradeData.accountNumber);

    /* 출금 트렌젝션 */
    await this.dataSource.transaction(async (manager) => {
      const createWithdrawals = await manager.create(Trade, { account: { id: reqId }, status: 0, amount: tradeData.amount });
      const resultWithdrawals = await manager.save(Trade, createWithdrawals);

      const createWithdrawalsLog = await manager.create(Log, {
        trade: { id: resultWithdrawals.id },
        status: resultWithdrawals.status,
        context: `[계좌이체/출금] 한별은행 서울지점 ATM`,
        result: true,
      });
      await manager.save(Log, createWithdrawalsLog);
    });
    await this.cacheManager.del(tradeData.phone);
    return { message: '출금이 완료되었습니다.' };
  }
}
