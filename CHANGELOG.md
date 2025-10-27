# Changelog

## [2025-10-27] Owner Dashboard 개선 및 예약 관리 기능 추가

### 🎯 작업 목표
- Owner Dashboard를 사이트 중심으로 재설계
- 예약 달력 추가로 예약 현황 시각화
- 예약 상세 정보 모달 구현
- UI/UX 개선

### ✨ 주요 변경사항

#### 백엔드 (Spring Boot)
1. **OwnerDashboardStatsResponse DTO 재설계**
   - 사이트 중심 통계로 전환 (16개 필드)
   - `totalSites`, `availableSites`, `siteOccupancyRate` 추가
   - `averageRevenuePerSite`, `totalSiteRevenue` 추가
   - 사이트 타입별 통계 추가

2. **OwnerService 로직 개선**
   - 사이트 기반 통계 계산 로직 구현
   - 캠핑장별 → 사이트별 집계로 변경

3. **Owner 예약 API 추가**
   - `GET /v1/owner/reservations` 엔드포인트 추가
   - Owner가 소유한 모든 캠핑장의 예약 조회
   - `ReservationRepository.findByCampgroundIdIn()` 메서드 추가

4. **캐싱 설정**
   - `@Cacheable` 어노테이션으로 Dashboard 통계 캐싱 (TTL: 1분)

#### 프론트엔드 (Next.js)
1. **ReservationCalendar 컴포넌트 생성**
   - 월별 달력 뷰로 예약 현황 표시
   - 예약 상태별 색상 구분 (확정: 녹색, 대기: 노랑, 완료: 파랑, 취소: 빨강)
   - 날짜별 모든 예약 표시
   - 사이트 번호 명시적 표시
   - 예약 클릭 시 상세 모달 표시

2. **ReservationDetailModal 컴포넌트 생성**
   - 예약 번호, 상태 배지
   - 캠핑장 및 사이트 정보
   - 체크인/체크아웃 날짜, 총 숙박일
   - 예약자 정보 (이름, 이메일, 연락처)
   - 결제 금액 및 결제 수단
   - 특이사항 표시
   - Lucide React 아이콘 사용

3. **Owner Dashboard 개선**
   - 사이트 중심 통계 표시
   - 예약 달력 탭 추가
   - 예약 현황 탭에 사이트 번호 표시
   - Overview 탭의 다가오는 체크인에 사이트 번호 추가

4. **타입 정의 업데이트**
   - `Reservation` 인터페이스에 `userEmail`, `userPhone`, `paymentMethod`, `totalPrice` 필드 추가
   - 중복 타입 정의 제거 및 통합

5. **캐싱 최적화**
   - SSR에서 `revalidate` 옵션 추가 (캠핑장: 60초, 예약: 30초)

6. **텍스트 가독성 개선**
   - 모달 내 값 텍스트: `font-medium` → `font-semibold`
   - 레이블 크기: `text-sm` 적용
   - 중요 정보 강조 (총 숙박일: `text-lg font-bold`)

### 🔧 기술적 개선
- **의존성 관리**: Docker 컨테이너에서 `lucide-react` 패키지 설치 및 설정
- **코드 품질**: Native JavaScript로 날짜 포맷팅 구현 (date-fns 제거)
- **아이콘**: 이모지 대신 Lucide React 아이콘 사용

### 📝 파일 변경 목록
**백엔드:**
- `src/main/java/org/v1/owner/dto/OwnerDashboardStatsResponse.java`
- `src/main/java/org/v1/owner/service/OwnerService.java`
- `src/main/java/org/v1/owner/controller/OwnerController.java`
- `src/main/java/org/v1/reservation/repository/ReservationRepository.java`

**프론트엔드:**
- `src/components/owner/dashboard/ReservationCalendar.tsx` (신규)
- `src/components/owner/dashboard/ReservationDetailModal.tsx` (신규)
- `src/components/owner/dashboard/tabs/OwnerOverviewTab.tsx`
- `src/components/owner/dashboard/tabs/OwnerReservationsTab.tsx`
- `src/components/owner/dashboard/OwnerDashboardClient.tsx`
- `src/types/index.ts`
- `src/lib/api/ownerApi.ts`

### 🐛 해결된 이슈
- Owner Dashboard에서 사이트 정보 누락 문제 해결
- 예약 목록에 사이트 번호 미표시 문제 해결
- Docker 환경에서 패키지 의존성 불일치 문제 해결
- 모달 텍스트 가독성 저하 문제 해결

---

# 타임존 및 결제 타이머 개선 작업 완료

## 📅 작업 일자

2025년 10월 24일

## 🎯 작업 목표

1. 백엔드 UTC 저장 및 프론트엔드 로컬 시간 변환 구현
2. 30분 결제 타임아웃 기능 구현
3. 결제 타이머 시간 계산 버그 수정

---

## 1. 타임존 아키텍처 변경

### 문제점

- 기존: Asia/Seoul 하드코딩으로 국제 사용자 지원 불가
- 모든 시간이 한국 시간으로만 표시됨

### 해결 방안

**백엔드: UTC 저장 + 프론트엔드: 로컬 변환**

#### 백엔드 변경사항

1. **CampApplication.java**

   - JVM 기본 타임존을 UTC로 설정
   - JPA Auditing DateTimeProvider를 UTC로 설정

   ```java
   @PostConstruct
   public void init() {
     TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
   }

   @Bean
   public DateTimeProvider auditingDateTimeProvider() {
     return () -> Optional.of(LocalDateTime.now(ZoneOffset.UTC));
   }
   ```

2. **application.yml**

   - Hibernate JDBC 타임존: UTC
   - Jackson 직렬화 타임존: UTC

   ```yaml
   hibernate.jdbc.time_zone: UTC
   jackson.time-zone: UTC
   jackson.date-format: yyyy-MM-dd'T'HH:mm:ss'Z'
   ```

3. **Reservation.java**
   - Hibernate annotations → Spring Data JPA auditing
   - `@CreationTimestamp` → `@CreatedDate`
   - `@UpdateTimestamp` → `@LastModifiedDate`

#### 프론트엔드 변경사항

1. **dateUtils.ts 통합**

   - timeUtils.ts를 dateUtils.ts로 통합
   - 모든 날짜/시간 함수가 UTC → 로컬 자동 변환
   - **핵심**: LocalDateTime의 Z 없는 ISO 문자열 처리

   ```typescript
   // Z가 없는 경우 (LocalDateTime), UTC로 강제 변환
   const normalizedDateString = dateString.endsWith("Z")
     ? dateString
     : dateString + "Z";
   const date = new Date(normalizedDateString);
   ```

2. **주요 유틸리티 함수**
   - `formatToLocalTime()`: ISO 8601 → 사용자 로컬 시간
   - `formatDateTimeKorean()`: 한국어 형식 표시
   - `formatDateOnly()`: 날짜만 표시
   - `formatTimeOnly()`: 시간만 표시
   - `formatRelativeTime()`: 상대 시간 ("5분 전")
   - `formatDateKorean()`: 레거시 호환 (Java 배열 지원)

### 작동 원리

```
백엔드: LocalDateTime → "2025-10-24T03:30:00" (Z 없음)
↓
프론트: "2025-10-24T03:30:00" + "Z" → "2025-10-24T03:30:00Z"
↓
JavaScript: UTC로 해석 → 사용자의 로컬 시간으로 변환
↓
한국: 12:30, 미국 동부: 23:30, 일본: 12:30
```

---

## 2. 30분 결제 타임아웃 기능

### 구현 내용

1. **백엔드 스케줄러**

   - `ReservationCancellationScheduler.java` 생성
   - 매 5분마다 실행 (`@Scheduled(cron = "0 */5 * * * *")`)
   - 30분 초과 PENDING 예약 자동 취소

   ```java
   @Scheduled(cron = "0 */5 * * * *")
   public void cancelUnpaidReservations() {
     LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(30);
     List<Reservation> unpaidReservations =
       reservationRepository.findByStatusAndCreatedAtBefore(PENDING, cutoffTime);
     // 자동 취소 처리
   }
   ```

2. **프론트엔드 타이머**
   - `PaymentTimer.tsx` 컴포넌트 생성
   - 실시간 카운트다운 표시
   - 색상 구분: 파란색(>10분), 노란색(5-10분), 빨간색(<5분)
   - ReservationsTab과 PaymentModal에 통합

---

## 3. 결제 타이머 버그 수정

### 문제점

예약 직후에도 "시간 만료"로 표시

### 원인

```
백엔드: LocalDateTime → "2025-10-23T12:30:00" (Z 없음)
↓
JavaScript: new Date("2025-10-23T12:30:00") → 로컬 12:30으로 해석
↓
한국(UTC+9)에서는 실제 UTC보다 9시간 빠르게 계산
↓
이미 만료된 것처럼 보임 ❌
```

### 해결

**PaymentTimer.tsx & PaymentModal.tsx 수정**

```typescript
// Z 추가하여 UTC로 강제 변환
const normalizedCreatedAt = createdAt.endsWith("Z")
  ? createdAt
  : createdAt + "Z";
const createdTime = new Date(normalizedCreatedAt).getTime();
```

---

## 4. 컴포넌트별 수정 사항

### 직접 수정된 컴포넌트

- ✅ `PaymentConfirmation.tsx`: `new Date().toLocaleString()` → `formatDateKorean()`
- ✅ `OwnerReservationsTab.tsx`: `new Date().toLocaleDateString()` → `formatDateOnly()`
- ✅ `DateRangePicker.tsx`: `new Date().toLocaleDateString()` → `formatToLocalTime()`
- ✅ `PaymentTimer.tsx`: Z 없는 ISO 문자열 처리 추가
- ✅ `PaymentModal.tsx`: Z 없는 ISO 문자열 처리 추가

### 자동 지원되는 컴포넌트 (formatDateKorean 사용)

- PaymentHistory.tsx
- ReservationsTab.tsx
- ReviewsTab.tsx
- FavoritesTab.tsx
- ReviewsSection.tsx
- ReservationsClient.tsx
- GuestReservationLookupClient.tsx

---

## 5. 테스트 결과

### dateUtils 테스트

```bash
✓ ISO 8601 형식을 로컬 시간으로 변환
✓ 날짜만 있는 형식 처리
✓ 한국어 형식 변환
✓ 상대 시간 표시
✓ Java LocalDateTime 배열 처리
✓ Z 있는 UTC 시간 처리
✓ Z 없는 UTC 시간 처리 (LocalDateTime)

총 14개 테스트 통과 ✅
```

### PaymentTimer 테스트

```bash
✓ Z 없는 UTC 시간 처리
  - 5분 전 예약: 25분 남음 ✅
✓ Z 있는 UTC 시간 처리
  - 5분 전 예약: 25분 남음 ✅
✓ 방금 생성된 예약
  - 1초 전: 29분 남음 ✅
✓ 30분 경과된 예약
  - 31분 전: 만료 (음수) ✅

총 4개 테스트 통과 ✅
```

---

## 6. 영향 및 개선 사항

### 긍정적 영향 ✅

- **국제화 지원**: 전 세계 어디서든 로컬 시간으로 표시
- **일광 절약 시간(DST) 자동 처리**
- **서버 간 시간 동기화 간소화**: 모두 UTC 기준
- **타임존 관련 버그 감소**
- **사용자 경험 향상**: 친숙한 로컬 시간 표시

### 주의사항 ⚠️

- **기존 데이터**: 이미 Asia/Seoul로 저장된 데이터는 마이그레이션 필요
- **개발 환경**: 개발자의 로컬 시간으로 표시됨 (의도된 동작)
- **디버깅**: 서버 로그는 UTC, 브라우저는 로컬 시간

---

## 7. 파일 변경 목록

### 백엔드

```
src/main/java/com/campstation/camp/
├── CampApplication.java (수정)
├── reservation/
│   ├── domain/Reservation.java (수정)
│   ├── repository/ReservationRepository.java (메서드 추가)
│   └── scheduler/ReservationCancellationScheduler.java (신규)
└── resources/
    └── application.yml (수정)
```

### 프론트엔드

```
src/
├── lib/
│   ├── dateUtils.ts (수정 - timeUtils 통합)
│   └── __tests__/
│       └── dateUtils.test.ts (신규)
├── components/
│   ├── PaymentConfirmation.tsx (수정)
│   ├── PaymentModal.tsx (수정)
│   ├── campground-detail/
│   │   └── DateRangePicker.tsx (수정)
│   ├── owner/dashboard/tabs/
│   │   └── OwnerReservationsTab.tsx (수정)
│   └── dashboard/
│       ├── PaymentTimer.tsx (수정)
│       └── __tests__/
│           └── PaymentTimer.test.ts (신규)
└── 문서/
    ├── TIMEZONE_MIGRATION.md (신규)
    ├── UTC_FIX_SUMMARY.md (신규)
    └── PAYMENT_TIMER_FIX.md (신규)
```

---

## 8. 배포 체크리스트

### 백엔드

- [x] UTC 타임존 설정 확인
- [x] JPA Auditing 설정 확인
- [x] 스케줄러 실행 확인
- [x] 컴파일 에러 없음
- [ ] 프로덕션 배포 전 기존 데이터 마이그레이션

### 프론트엔드

- [x] dateUtils 함수 테스트 통과
- [x] PaymentTimer 테스트 통과
- [x] Lint 에러 없음
- [x] 빌드 성공
- [ ] 실제 환경에서 타이머 동작 확인

---

## 9. 다음 단계

1. **모니터링**

   - 타임존 관련 오류 로그 확인
   - 자동 취소 스케줄러 동작 확인
   - 사용자 피드백 수집

2. **최적화**

   - 대량 데이터에 대한 스케줄러 성능 테스트
   - 타이머 UI/UX 개선

3. **문서화**
   - API 문서에 "모든 시간은 UTC로 반환됨" 명시
   - 사용자 가이드 업데이트

---

## 10. 참고 자료

- [ISO 8601 표준](https://en.wikipedia.org/wiki/ISO_8601)
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Spring Data JPA Auditing](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#auditing)
- [JavaScript Date 타임존 처리](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

---

## ✅ 작업 완료

- 백엔드 UTC 저장 구현
- 프론트엔드 로컬 시간 변환 구현
- 30분 결제 타임아웃 기능 구현
- 결제 타이머 버그 수정
- 전체 테스트 통과
- 문서화 완료
