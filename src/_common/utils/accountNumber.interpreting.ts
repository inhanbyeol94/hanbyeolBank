export const InterpretingAccountNumber = (accountNumber: string): { id: number; time: string } => {
  /*
   * aabbbb-cc-dddddd
   * a : 은행 코드 (93)
   * b : 생성 index (0~9999) 만단위의 경우 c에서 표기
   * c : index 만 단위 표기 (default 00)
   * d : 생성일자 기준 hh:mm:ss 거꾸로 (16:01:32 -> 231061)
   */

  const splitAccountNumber = {
    a: accountNumber.substring(0, 2),
    b: accountNumber.substring(2, 6),
    c: accountNumber.substring(7, 9),
    d: accountNumber.substring(10, 16),
  };

  return { id: Number(splitAccountNumber.b) + Number(splitAccountNumber.c) * 10000, time: splitAccountNumber.d.split('').reverse().join('') };
};
