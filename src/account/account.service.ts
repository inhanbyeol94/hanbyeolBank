import { BadRequestException, ForbiddenException, HttpException, Inject, Injectable } from '@nestjs/common';
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
import { VerifyAccountDto } from '../_common/dtos/verifyAccount.dto';
import { IResult } from '../_common/interfaces/result.interface';
import { InterpretingAccountNumber } from '../_common/utils/accountNumber.interpreting';
import { accountNumberVerify } from '../_common/utils/accountNumber.verify';
import { find } from 'rxjs';
import { VerifyAccountNumberDto } from '../_common/dtos/verifyAccountNumber.dto';
import { PartnerDto } from '../_common/dtos/partner.dto';
import { Partner } from '../_common/entities/partner.entity';
import { ISecretKey } from '../_common/interfaces/secretKey.interface';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(AccountType) private accountTypeRepository: Repository<AccountType>,
    @InjectRepository(Partner) private partnerRepository: Repository<Partner>,

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
    const findByVerifyData: IClientVerifyIdentity = await this.cacheManager.get(newAccount.phone);
    if (!findByVerifyData || findByVerifyData.verify !== true) throw new HttpException('핸드폰 인증이 완료되지 않았습니다.', 403);

    /* 어뷰징 유저 의심 요청으로 인증캐시 삭제 */
    if (+findByVerifyData.sequence !== newAccount.sequence || findByVerifyData.type !== 101) {
      await this.cacheManager.del(newAccount.phone);
      throw new HttpException('핸드폰 인증이 완료되지 않았습니다.', 403);
    }

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

    await this.cacheManager.del(newAccount.phone);

    /* 예금계좌 반환 */
    return { message: '예금계좌가 정상 생성되었습니다.', accountNumber: extractAccountNumber(createAccount) };
  }

  async verifyIdentityAndAccount(verifyAccount: VerifyAccountDto): Promise<IResult> {
    const findByVerifyData: IClientVerifyIdentity = await this.cacheManager.get(verifyAccount.phone);
    if (!findByVerifyData || findByVerifyData.verify !== true) throw new HttpException('핸드폰 인증이 완료되지 않았습니다.', 403);

    /* 어뷰징 유저 의심 요청으로 인증캐시 삭제 */
    if (+findByVerifyData.sequence !== verifyAccount.sequence || findByVerifyData.type !== 105) {
      await this.cacheManager.del(verifyAccount.phone);
      throw new HttpException('핸드폰 인증이 완료되지 않았습니다.', 403);
    }
    const { id, time } = InterpretingAccountNumber(verifyAccount.accountNumber);
    const findByAccount = await this.accountRepository.findOne({ where: { id }, relations: ['client'] });

    if (!accountNumberVerify(time, findByAccount)) throw new HttpException('예금계좌의 정보가 일치하지 않습니다.', 403);

    if (!findByAccount || findByAccount.client.name !== verifyAccount.name || findByAccount.client.phone !== verifyAccount.phone) {
      throw new HttpException('예금계좌의 정보가 일치하지 않습니다.', 403);
    }

    if (!(await bcrypt.compare(verifyAccount.residentRegistrationNumber, findByAccount.client.residentRegistrationNumber))) {
      await this.cacheManager.del(verifyAccount.phone);
      throw new HttpException('예금계좌의 정보가 일치하지 않습니다.', 403);
    }

    if (!(await bcrypt.compare(String(verifyAccount.password), findByAccount.password))) {
      throw new HttpException('예금계좌 비밀번호 오류', 403);
    }

    await this.cacheManager.del(verifyAccount.phone);

    return { result: true };
  }

  async verifyAndFindAccount(accountNumber): Promise<{ verify: boolean; data: Account }> {
    const { id, time } = InterpretingAccountNumber(accountNumber);
    const findByAccountIdx = await this.accountRepository.findOne({
      where: { id },
      relations: { client: true },
    });
    return { verify: accountNumberVerify(time, findByAccountIdx), data: findByAccountIdx };
  }

  async verifyAccountNumber(accountNumberData: VerifyAccountNumberDto): Promise<IResult> {
    const { data } = await this.verifyAndFindAccount(accountNumberData.accountNumber);
    if (data.client.name !== accountNumberData.name) throw new HttpException('계좌번호와 이름을 확인해주세요.', 403);
    return { result: true };
  }

  async addPartner(partnerData: PartnerDto): Promise<ISecretKey> {
    const { data } = await this.verifyAndFindAccount(partnerData.accountNumber);
    if (!data) throw new HttpException('정보가 일치하지 않습니다.', 403);
    if (data.client.name !== partnerData.name) throw new HttpException('정보가 일치하지 않습니다.', 403);
    if (data.client.phone !== partnerData.phone) throw new HttpException('정보가 일치하지 않습니다.', 403);
    const verifyPassword = await bcrypt.compare(partnerData.password, data.password);
    if (!verifyPassword) throw new HttpException('정보가 일치하지 않습니다.', 403);

    const { id } = InterpretingAccountNumber(partnerData.accountNumber);
    const isKey = await this.partnerRepository.findOneBy({ account: { id } });
    console.log(isKey);
    if (isKey) throw new HttpException('이미 발급된 키가 존재합니다.', 403);

    const createKey = Math.random().toString(36).substring(2, 11);
    const hashKey = await bcrypt.hash(createKey, 10);

    const createPartner = await this.partnerRepository.create({ key: hashKey, account: { id } });
    await this.partnerRepository.save(createPartner);

    return { message: '정상 계약되었습니다.', secretKey: createKey };
  }
}
