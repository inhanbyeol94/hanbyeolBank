import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../_common/entities/account.entity';
import { Repository } from 'typeorm';
import { AccountType } from '../_common/entities/accountType.entity';
import { CreateAccountTypeDto } from '../_common/dtos/createAccountType.dto';
import { IMessage } from '../_common/interfaces/message.interface';
import { CreateAccountDto } from '../_common/dtos/createAccount.dto';
import { IAccountNumber } from '../_common/interfaces/accountNumber.interface';
import { ClientService } from '../client/client.service';
import * as bcrypt from 'bcrypt';
import { IClientVerifyIdentity } from '../_common/interfaces/clientVerifyIdentity.interface';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { extractAccountNumber } from '../_common/utils/accountNumber.extract';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(AccountType) private accountTypeRepository: Repository<AccountType>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private clientService: ClientService,
  ) {}
  async createAccountType(newAccountType: CreateAccountTypeDto): Promise<IMessage> {
    const existAccountType = await this.accountTypeRepository.findOne({ where: { name: newAccountType.name } });
    if (existAccountType) throw new HttpException('이미 등록된 예금계좌 타입입니다.', 403);
    await this.accountTypeRepository.save(newAccountType);
    return { message: '정상 등록되었습니다.' };
  }
  async createAccount(newAccount: CreateAccountDto): Promise<IAccountNumber> {
    /* 본인확인 검증 */
    const findByVerifyData: IClientVerifyIdentity = await this.cacheManager.get(newAccount.phone);
    if (!findByVerifyData || findByVerifyData.sequence !== 1 || findByVerifyData.type !== 101) throw new HttpException('핸드폰 인증이 완료되지 않았습니다.', 403);

    /* 본인확인 정보로 사용자 인덱스 추출 */
    const clientId = await this.clientService.existClient(newAccount.name, newAccount.phone, newAccount.residentRegistrationNumber);

    /* 예금계좌 타입 존재여부 검증 */
    const existAccountType = await this.accountTypeRepository.findOne({ where: { id: newAccount.typeId } });
    if (!existAccountType) throw new HttpException('등록되지 않은 예금계좌의 타입입니다.', 404);

    /* 예금계좌 패스워드 암호화 */
    newAccount.password = await bcrypt.hash(newAccount.password, 10);

    /* 예금계좌 생성 */
    const createAccount = await this.accountRepository.save({
      client: { id: clientId },
      accountType: { id: newAccount.typeId },
      password: newAccount.password,
    });

    /* 예금계좌 반환 */
    return { message: '예금계좌가 정상 생성되었습니다.', accountNumber: extractAccountNumber(createAccount) };
  }
}
