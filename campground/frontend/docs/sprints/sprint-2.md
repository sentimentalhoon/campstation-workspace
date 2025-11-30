# Sprint 2: 결제 및 예약 관리

**상태**: ✅ 완료  
**기간**: 2025-11-09 (1일)  
**목표**: 결제 연동 및 예약 내역 관리

---

## 📋 주요 태스크

### 1. 토스 페이먼츠 연동 ✅

- [x] SDK 설치 및 설정
  - [x] `@tosspayments/payment-widget-sdk` 설치
  - [x] 환경변수 설정 (클라이언트 키, 시크릿 키)
  - [x] TossPaymentWidget 컴포넌트 생성
- [x] 결제 페이지 구현
  - [x] `app/payment/page.tsx` 생성
  - [x] 주문 정보 표시 (Order Summary)
  - [x] 가격 상세 표시 (PriceBreakdown 컴포넌트 사용)
  - [x] 약관 동의 체크박스 (Checkbox 컴포넌트)
  - [x] 결제 위젯 UI 통합 (`TossPaymentWidget` 컴포넌트)
- [x] 결제 완료 처리
  - [x] `app/payment/success/page.tsx` - 성공 페이지
  - [x] `app/payment/fail/page.tsx` - 실패 페이지
  - [x] 백엔드 결제 검증 API 연동
  - [x] 예약 확정 처리
- [x] 에러 처리
  - [x] 결제 실패 시나리오 (토스 에러 코드 매핑)
  - [x] 에러 메시지 표시
  - [x] 재시도 및 네비게이션

**완료도**: 100% (4/4)

**구현 완료 항목**:

- ✅ Checkbox UI 컴포넌트 생성
- ✅ lucide-react 아이콘 라이브러리 설치
- ✅ TossPaymentWidget 컴포넌트 (`components/features/payment/TossPaymentWidget.tsx`)
- ✅ 결제 페이지 레이아웃 (06-SCREEN-LAYOUTS.md 준수)
- ✅ Suspense를 사용한 useSearchParams 처리
- ✅ 결제 성공 페이지 (결제 확인 로직, 결과 표시)
- ✅ 결제 실패 페이지 (에러 코드 매핑, 가이드 메시지)
- ✅ PaymentService 백엔드 API 연동

**참고 문서**:

- `06-SCREEN-LAYOUTS.md` - 결제 페이지 레이아웃
- `04-API-SPEC.md` - 결제 API 엔드포인트
- [토스 페이먼츠 공식 문서](https://docs.tosspayments.com/)

---

### 2. 예약 내역 페이지 ✅

- [x] 예약 목록 페이지
  - [x] `app/reservations/page.tsx` 구조
  - [x] 탭 UI (예정/완료/취소)
  - [x] ReservationCard 컴포넌트 사용
  - [x] 빈 상태 처리 (Empty State)
  - [x] API 연동 완료
- [x] 예약 상세 페이지
  - [x] `app/reservations/[id]/page.tsx` 구조
  - [x] QR 코드 표시
  - [x] 캠핑장 정보
  - [x] 예약 상세 정보
  - [x] 결제 정보
  - [x] 상태별 액션 버튼 (예약 취소)
- [x] API 연동
  - [x] 예약 목록 조회 (`useReservations`)
  - [x] 예약 상세 조회 (`useReservationDetail`)
  - [x] 예약 취소 (`useCancelReservation`)
- [x] 상태 관리
  - [x] 예약 상태 필터링
  - [x] 낙관적 업데이트 (취소 시)

**완료도**: 100% (4/4)

**참고 문서**:

- `06-SCREEN-LAYOUTS.md` - 예약 내역 & 상세 레이아웃
- `04-API-SPEC.md` - 예약 API
- `05-DATA-MODELS.md` - Reservation 타입

---

### 3. 컴포넌트 개발 ✅

#### ReservationCard

- [x] 컴포넌트 파일: `components/features/reservation/ReservationCard.tsx`
- [x] Props: `reservation`, `onClick`
- [x] UI 요소:
  - [x] 캠핑장 썸네일 이미지
  - [x] 캠핑장 이름
  - [x] 예약 날짜 (체크인/아웃)
  - [x] 예약 상태 배지
  - [x] 예약 번호
- [x] 상태별 스타일
  - [x] 예정: primary
  - [x] 완료: success
  - [x] 취소: neutral

**완료도**: 100% (1/1)

#### PriceBreakdown

- [x] 컴포넌트 파일: `components/features/reservation/PriceBreakdown.tsx`
- [x] Props: `basePrice`, `nights`, `discount`, `total`
- [x] UI 요소:
  - [x] 사이트 요금 (기본가 × 박수)
  - [x] 할인 금액 (있는 경우)
  - [x] 구분선
  - [x] 총 결제 금액 (강조)
- [x] 금액 포맷팅 (천 단위 쉼표)

**완료도**: 100% (1/1)

#### QRCode

- [x] 컴포넌트 파일: `components/features/reservation/QRCode.tsx`
- [x] 라이브러리: `qrcode.react` 설치
- [x] Props: `value` (예약 번호), `size`
- [x] UI 요소:
  - [x] QR 코드 이미지
  - [x] 설명 텍스트
  - [x] 다운로드 버튼

**완료도**: 100% (1/1)

---

## 🎯 완료 기준

- [x] 토스 페이먼츠로 결제 프로세스 완료 가능
- [x] 예약 내역을 목록과 상세로 확인 가능
- [x] QR 코드 생성 및 표시
- [x] 예약 취소 기능 동작
- [x] 모든 페이지가 `06-SCREEN-LAYOUTS.md` 명세 준수
- [x] TypeScript 에러 없음
- [x] 빌드 성공

---

## 📊 진행 상황

- **전체 진행도**: 100% ✅ (10/10 태스크)
- **토스 페이먼츠 연동**: 100% ✅ (4/4)
- **예약 내역 페이지**: 100% ✅ (4/4)
- **컴포넌트 개발**: 100% ✅ (3/3)

---

## 📝 노트

### 토스 페이먼츠 통합 시 주의사항

1. **클라이언트 키 vs 시크릿 키**
   - 클라이언트 키: 프론트엔드에서 위젯 초기화용 (공개 가능)
   - 시크릿 키: 백엔드에서 결제 검증용 (비공개)
2. **결제 플로우**
   - 예약하기 → 결제 페이지 → 토스 위젯 → 성공/실패 → 백엔드 검증 → 예약 확정
3. **금액 검증**
   - 프론트엔드에서 계산한 금액과 백엔드 검증 필수
4. **에러 처리**
   - 사용자 취소, 결제 실패, 네트워크 에러 등 모든 케이스 처리

### 예약 내역 상태

- `PENDING`: 결제 대기
- `CONFIRMED`: 예약 확정
- `COMPLETED`: 이용 완료
- `CANCELLED`: 취소됨

### QR 코드 데이터

- 형식: `RSV-{reservationId}-{timestamp}`
- 사용처: 캠핑장 입장 시 체크인 검증

---

## 🔧 주요 이슈 및 해결

### 1. API 엔드포인트 401 Unauthorized 에러

**문제**: `/api/v1/campgrounds/{id}/sites` 호출 시 401 에러 발생

**원인**: Spring Security의 requestMatchers 순서 문제

- `/api/v1/campgrounds/{id}` 패턴은 정확히 일치하는 경로만 허용
- `/api/v1/campgrounds/**` catch-all 규칙이 sites 엔드포인트를 인증 필요로 처리

**해결책**:

```java
// JwtSecurityConfig.java
.requestMatchers(HttpMethod.GET, "/api/v1/campgrounds/{id}/sites").permitAll()
```

구체적인 GET 요청 패턴을 catch-all 규칙보다 앞에 추가

### 2. sites.find is not a function 에러

**문제**: 예약 페이지에서 사이트 선택 시 타입 에러 발생

**원인**: API 응답이 `PageResponseDto` 형식인데 배열로 처리

- 백엔드: `ApiResponse<PageResponseDto<Site>>` 반환
- 프론트엔드: `response.data`를 배열로 가정

**해결책**:

```typescript
// types/api/response.ts
export type CampgroundSitesResponse = ApiResponse<PageResponse<Site>>;

// app/reservations/new/page.tsx
setSites(response.data.content || []);
```

---

**완료 일자**: 2025-11-09  
**마지막 업데이트**: 2025-11-09
