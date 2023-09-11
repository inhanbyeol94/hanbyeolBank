import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '../_common/entities/client.entity';
import { Repository } from 'typeorm';
import { IMessage } from '../_common/interfaces/message.interface';
import { CreateClientDto } from '../_common/dtos/createClient.dto';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IClientVerifyIdentity } from '../_common/interfaces/clientVerifyIdentity.interface';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client) private clientRepository: Repository<Client>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async createClient(newClientData: CreateClientDto): Promise<IMessage> {
    const findByVerifyData: IClientVerifyIdentity = await this.cacheManager.get(newClientData.phone);
    if (!findByVerifyData || findByVerifyData.verify !== true) throw new HttpException('핸드폰 인증이 완료되지 않았습니다.', 403);

    /* 어뷰징 유저 의심 요청으로 인증캐시 삭제 */
    if (findByVerifyData.sequence !== newClientData.sequence || findByVerifyData.type !== 100) {
      await this.cacheManager.del(newClientData.phone);
      throw new HttpException('핸드폰 인증이 완료되지 않았습니다.', 403);
    }

    /* 기사용자 정보 조회 */
    const findByClient = await this.clientRepository.findOne({
      where: { name: newClientData.name, phone: newClientData.phone },
    });

    if (findByClient) {
      if (await bcrypt.compare(newClientData.residentRegistrationNumber, findByClient.residentRegistrationNumber))
        throw new HttpException('이미 등록된 고객입니다.', 403);
    }

    /* 요청 휴대폰 번호 기준 기가입 데이터 호출 */
    const findByPhone = await this.findByPhone(newClientData.phone);

    /* 기가입 데이터 유효성 검사 */
    if (findByPhone) {
      await this.cacheManager.del(newClientData.phone);
      throw new HttpException('이미 사용중인 휴대폰번호 입니다.', 403);
    }

    const compare = await bcrypt.compare(newClientData.name + newClientData.residentRegistrationNumber + newClientData.phone, findByVerifyData.hash);

    if (!compare) {
      await this.cacheManager.del(newClientData.phone);
      throw new HttpException('잘못된 요청입니다.', 403);
    }

    newClientData.residentRegistrationNumber = await bcrypt.hash(newClientData.residentRegistrationNumber, 10);

    await this.clientRepository.save(newClientData);
    await this.cacheManager.del(newClientData.phone);
    return { message: '정상 등록되었습니다.' };
  }

  async findByPhone(phone: string): Promise<Client> {
    return await this.clientRepository.findOne({ where: { phone } });
  }

  async existClient(name: string, phone: string, residentRegistrationNumber: string): Promise<number> {
    const findByClient = await this.clientRepository.findOne({ where: { name, phone } });
    const residentRegistrationNumberValid = await bcrypt.compare(residentRegistrationNumber, findByClient.residentRegistrationNumber);
    if (!residentRegistrationNumberValid) {
      await this.cacheManager.del(phone);
      throw new HttpException('사용자 정보가 일치하지 않습니다.', 403);
    }
    return findByClient.id;
  }
}
