# HanbyeolBank



## 프로젝트 소개

나중애 중고마켓 서비스에 연동될 가상은행 API 서버입니다.

거래 시 해당 은행 API를 통해 입출금 서비스를 연동하여 사용할 예정입니다.

ERD 및 API 명세서의 경우 [여기](https://jagged-scent-ad9.notion.site/a8cd8e1b13fd4e6e89d5a11831a378fc?pvs=4)를 클릭해주세요.

---

## 프로젝트 참여자

- 인한별

---

## 프로젝트 구현

- 클라이언트 생성
  1. 본인확인 요청
  2. 본인확인 완료
  3. 클라이언트 생성



- 예금계좌 생성

  1. 본인확인 요청
  2. 본인확인 완료
  3. 예금계좌 생성

  

- 예금계좌에 무통장 입금
  1. 본인확인 요청
  2. 본인확인 완료
  3. 입력한 금액만큼 입금 처리



- 거래 시스템 구현
  1. 본인확인 요청
  2. 본인확인 완료
  3. 특정 계좌로 송금요청

---

## 프로젝트 핵심

1. 비록 가상은행이지만, 최대한 보안에 대한 설계를 고려하여 구현 예정
2. 코드에 대한 재사용성을 고려하여 중복코드 최소화 예정
3. 프로젝트 진행 시 꾸준한 커밋 기록과 커밋 컨벤션을 준수할 예정
4. 코드의 유지보수만큼 작업현황 또한 유지보수에 신경쓸 수 있도록 작업할 예정

---
## 프로젝트 설정



### 라이브러리 설치 목록
```bash
npm install @nestjs/config
npm install @nestjs/typeorm typeorm mysql2
npm install class-validator class-transformer
npm install typeorm-naming-strategies
npm install bcrypt
```


### .prettierrc 설정

```bash
/* add options */
  "printWidth": 170,
  "tabWidth": 2,
```


### .eslintrc.js 설정

```bash
/* add rules */
'prettier/prettier': ['error', { printWidth: 170 }]
```

