import { HttpException, Inject, Injectable } from '@nestjs/common';
import { smsSend } from '../_common/utils/sms.send';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { IdentityVerifyDto } from '../_common/dtos/identityVerify.dto';
import { IMessage } from '../_common/interfaces/message.interface';
import { identityVerifyTypes } from '../_common/utils/sms.type';
import { IClientVerifyIdentity } from '../_common/interfaces/clientVerifyIdentity.interface';
import { VerificationRequestDto } from '../_common/dtos/identityVerificationRequest.dto';
import { ISequence } from '../_common/interfaces/sequence.interface';

@Injectable()
export class IdentityService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async sendAuthentication(verifyData: VerificationRequestDto): Promise<ISequence> {
    /* 인증 타입 유효성 검증 */
    if (identityVerifyTypes.indexOf(verifyData.type) == -1) throw new HttpException('잘못된 요청입니다.', 403);

    /* 6자리 난수 생성 */
    const authCode = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

    /* hash : 본인확인 인증을 대체한 이름, 연락처, 주민등록번호를 암호화 */
    const hash = await bcrypt.hash(verifyData.name + verifyData.residentRegistrationNumber + verifyData.phone, 10);

    /* 2자리 난수 생성 */
    const sequenceCode = String(Math.floor(Math.random() * 1000000)).padStart(2, '0');

    /* 휴대폰 번호를 키로 지정하여, 값에는 hash, code, type, status를 담아 Redis에 300초 동안 저장 */
    await this.cacheManager.set(verifyData.phone, { hash, code: authCode, type: verifyData.type, sequence: sequenceCode }, { ttl: 300 });

    /* Naver Cloud Platform SMS API를 통해 문자 발송 후 결과 메세지 반환 및 sequence값 반환 */
    return { message: await smsSend(verifyData.phone, `[한별은행] 요청하신 인증번호는 ${authCode}입니다.\n5분 내 인증을 완료해 주세요.`), sequence: sequenceCode };
  }

  async verifyAuthentication(verifyData: IdentityVerifyDto): Promise<IMessage> {
    /* redis에 저장 된 인증정보 호출 */
    const findByVerifyData: IClientVerifyIdentity = await this.cacheManager.get(verifyData.phone);

    /* 인증정보 유효성 검사 */
    if (!findByVerifyData) throw new HttpException('인증 시간이 만료되었거나, 잘못된 요청입니다.', 403);

    /* sequence 검사 */
    if (verifyData.sequence !== +findByVerifyData.sequence) {
      await this.cacheManager.del(verifyData.phone);
      throw new HttpException('잘못된 요청입니다.', 403);
    }

    /* 인증번호 일치여부 검사 */
    if (findByVerifyData.code !== verifyData.code) throw new HttpException('인증번호가 일치하지 않습니다.', 403);

    /* redis에 sequence 업데이트 후 10분 유효기간 설정 */
    await this.cacheManager.set(verifyData.phone, { ...findByVerifyData, sequence: 1 }, { ttl: 600 });

    return { message: '인증이 완료되었습니다.' };
  }
}
