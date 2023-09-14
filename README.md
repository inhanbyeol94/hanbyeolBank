*내일배움캠프 실전 프로젝트에 진행된 프로젝트입니다.*
나의 중고 애물단지, 줄여서 '나중애' 서비스에 모의 결제시스템을 연동할 한별은행 서비스를 구현하였습니다.

---
## 기술 스택 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/2048px-Typescript_logo_2020.svg.png" height="16px" width="16px">


<img src="https://d33wubrfki0l68.cloudfront.net/e937e774cbbe23635999615ad5d7732decad182a/26072/logo-small.ede75a6b.svg" height="100px" width="100px">

> NestJS
> TypeORM
> Redis
> NAVER CLOUD PLATFORM



<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K" height="100px" width="100px">   

> React
> Ant Design

---
## 구현 서비스
> 본인확인 인증
> 고객 등록
> 예금계좌 개설
> 무통장 입금
> 계좌이체
> 잔액 조회 및 거래내역 조회
> 출금
> 액세스키 발급
> 로그

---
### 본인확인 인증

>실명확인 인증 API를 대체한 모의적 본인확인 서비스를 구현하였습니다.
>본인확인 인증 서비스의 경우 은행 업무상 보안을 위주로 로직이 진행되어야 한다는 생각이 들었습니다.
그렇기에 사용자들이 특정 은행서비스를 진행하기 전 인증 절차를 진행할 수 있도록 로직을 구현하였습니다.

#### 특징
- 브라우저 내 탈취할 수 있는 인증방식이 아닌 본인이 실제 사용중인 핸드폰을 통해 인증
- 물리적 인증번호를 탈취하더라도, 요청 브라우저에 반환하는 난수를 인증 확인 시 전달받아야만 완료 가능
  <span style="font-size: 13px; color:gray; margin-left:10px;">(SMS로 발송 된 난수 6자리와, 요청 브라우저에 반환한 난수 6자리가 모두 일치해야 인증 가능)</span>
- 업무 별 1회 휘발성 인증 방식이며, 인증 요청 시 업무별 마다 고유한 타입들이 지정되어있어, 고유한 타입에 맞춰서 진행된 업무만 가능

#### 아쉬운 점
- 업무 별 1회 휘발성 인증 방식으로, 각 업무를 볼때마다 번거로운 인증을 진행해야하는 불편함
  <span style="font-size: 13px; color:gray;  margin-left:10px;">(본인확인 인증을 거친 후 짧은 시간의 액세스 토큰을 발급하여 토큰이 만료되기 전에는 추가적인 본인확인 인증을 생략할 수 있는 토큰 혹은 세션 인증방식이 필요)</span>

---
### 고객 등록

> 무통장 입금을 제외한 모든 서비스를 사용하기 위해선 고객을 등록해야합니다.

#### 특징
- 본인확인 인증 필요
- 등록 시 주민등록번호의 경우 단방향 암호화된 상태로 수집
- 등록된 정보 바탕으로 인증 시 본인 여부를 검증할 수 있음 (이름, 휴대폰번호, 주민등록번호)

#### 아쉬운 점
- 구현 당시 발견되지 않음

---
### 예금계좌 개설

> 고객 등록 후 이체 서비스 등 은행업무를 진행하기 위해 예금계좌를 개설할 수 있습니다.

#### 특징
- 본인확인 인증 필요
- 은행에는 이자 시스템이 있음을 인지하여 컨셉상 계좌타입을 지정할 수 있음
  <span style="font-size:12px; color:red">ex) 내일배움캠프 훈련 대상 (전국민)</span>

- 개설되는 예금계좌번호는 난수로 생성되지 않고 특정 패턴에 의해 생성됨
```
  aabbbb-cc-dddddd
  
  aa : 은행 고유번호 93
  bbbb : 천자리 단위의 인덱스 번호
  cc : 십만단위 단위 인덱스 번호
  dddddd : UTC시간 기준 생성된 시간을 뒤집은 6자리 수 (hh:mm:ss > ss:mm:hh)
```
<span style="font-size:12px; color:red">ex) 인덱스가 12345일 경우, 932345-01-******</span>
- 최대 999,999개의 계좌 등록이 가능

#### 아쉬운 점
- 생성되는 패턴의 경우 다소 제한적인 계좌 등록이 가능한 점
  <span style="font-size: 13px; color:gray;  margin-left:10px;">(계좌번호 자릿수에 의해 계좌 생성이 무한할 순 없으나, 예금계좌 타입별 테이블을 구분하여 보다 많은 예금계좌를 개설할 수 있도록 대체 가능)</span>
---
### 무통장 입금

> 고객 등록없이, 생성된 예금계좌에 누구나 송금할 수 있습니다.

#### 특징
- 고객등록 없이 생성된 예금계좌에 출처를 밝힌 후 송금할 수 있음
  <span style="font-size:12px; color:red">출처) 입금자 이름, 휴대폰 번호</span>

#### 아쉬운점
- 구현 당시 발견되지 않음
---
### 계좌이체

> 본인의 예금계좌에서 상대방에게 계좌 송금이 가능합니다.


#### 특징
- 본인확인 인증 필요
- 본인 계좌 유효성 검사 및 상대방 계좌 유효성 검사, 잔액 검증 진행

#### 아쉬운점
- 구현 당시 발견되지 않음
---
### 잔액 조회 및 거래내역 조회

> 본인의 예금계좌의 거래내역 과 잔액을 조회할 수 있습니다.

#### 특징
- 본인확인 인증 필요
- 여러개의 계좌를 보유할 수 있기때문에 1회적 휘발성 인증이 계좌조회를 완료한 시점에 사라지지 않고 10분간 유지됨

#### 아쉬운점
- 구현 당시 발견되지 않음
---
### 출금

> 본인의 예금계좌 잔액에 따라 출금이 가능합니다.

#### 특징
- 본인확인 인증 필요
- 모의 시스템으로 백엔드 구현되어있으나, 프론트 미적용

#### 아쉬운점
- 구현 당시 발견되지 않음
---
### 액세스키 발급

> 계좌이체 서비스 진행 시 본인확인 인증을 진행하지않고 계좌이체가 가능하도록 액세스키를 발급합니다.

#### 특징
- 본인확인 인증 필요
- 프로젝트 컨셉 상 사업자들이 발급받아 api를 연동하는 액세스키 입니다.
- 개인 계좌 또한 등록할 수 있어, 타 사이트에서 고객들을 등록하여 본인인증 서비스 생략하게 해줄 수 있습니다.

#### 아쉬운점
- 구현 당시 발견되지 않음
---
### 로그

> 은행업무 진행 시 진행단계에 따라 기록됩니다.


#### 아쉬운 점
- 은행 로직에 대한 이해도가 부족하다보니, 로그에 대한 로직을 구현하지 못하였습니다.
  특정 사용자가 무언가의 로직을 실행하게되면 실행 요청 로그와 결과여부까지 모두 redis에 보관하고있다가 최종 완료 혹은 실패가 발생하는 경우에 로그에 수집될 수 있도록 구현할 예정이었으나, 설계를 잘못하여 현재로써는 미구현에 가깝습니다.