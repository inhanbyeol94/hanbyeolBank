import { Account } from '../entities/account.entity';

export const extractAccountNumber = (createAccount: Account): string => {
  /*
   * aabbbb-cc-dddddd
   * a : 은행 코드 (93)
   * b : 생성 index (0~9999) 만단위의 경우 c에서 표기
   * c : index 만 단위 표기 (default 00)
   * d : 생성일자 기준 hh:mm:ss 거꾸로 (16:01:32 -> 231061)
   */

  const accountNumber = {
    a: '93',
    b: String(createAccount.id % 10000).padStart(4, '0'),
    c: String((createAccount.id - (createAccount.id % 10000)) / 10000).padStart(2, '0'),
    d: (
      String(new Date(createAccount.createdAt).getUTCHours()).padStart(2, '0') +
      String(new Date(createAccount.createdAt).getUTCMinutes()).padStart(2, '0') +
      String(new Date(createAccount.createdAt).getUTCSeconds()).padStart(2, '0')
    )
      .split('')
      .reverse()
      .join(''),
  };

  return `${accountNumber.a}${accountNumber.b}-${accountNumber.c}-${accountNumber.d}`;
};
