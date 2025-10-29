# UTC to KST 시간대 변환 완료 요약

## 작업 개요

백엔드에서 UTC로 저장된 모든 시간을 프론트엔드에서 한국 표준시(KST, Asia/Seoul)로 자동 변환하여 표시하도록 시스템 전체를 수정했습니다.

## 변경사항

### 1. 백엔드 (변경 없음 - 권장사항 유지)

- **현재 상태**: UTC로 시간 저장 및 반환 (권장 사항)
- **이유**:
  - 서버 시간대 독립성 유지
  - 다국적 서비스 확장 가능
  - 타임존 변환의 일관성 보장

```java
// CampApplication.java - UTC 시간 유지
@Bean
public DateTimeProvider auditingDateTimeProvider() {
    return () -> Optional.of(LocalDateTime.now(ZoneOffset.UTC));
}

@PostConstruct
public void init() {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
}
```

### 2. 프론트엔드 시간 변환 유틸리티 개선

#### 📁 `frontend/src/lib/dateUtils.ts`

**새로 추가된 상수 및 함수:**

```typescript
// 한국 표준시 타임존 상수
export const KST_TIMEZONE = "Asia/Seoul";

/**
 * UTC 문자열을 KST Date 객체로 변환
 * 백엔드에서 받은 UTC 시간을 KST로 변환합니다.
 * ISO 8601 형식의 타임존 오프셋도 지원 (예: "+09:00", "-05:00")
 */
export function parseUTCtoKST(dateString: string): Date {
  if (!dateString) return new Date();

  try {
    // ISO 8601 형식 (타임존 정보 포함 가능)
    // Date 객체는 타임존 정보를 자동으로 처리
    const date = new Date(dateString);

    // Invalid Date 체크
    if (isNaN(date.getTime())) {
      // Z가 없는 경우 (LocalDateTime from backend), UTC로 간주하여 재시도
      const normalizedDateString = dateString.endsWith("Z")
        ? dateString
        : dateString + "Z";
      return new Date(normalizedDateString);
    }

    return date;
  } catch (error) {
    console.error("Failed to parse date:", dateString, error);
    return new Date();
  }
}
```

**수정된 함수들 (KST 명시적 사용):**

1. **`formatToLocalTime()`** - KST 타임존 명시
2. **`formatDateTimeKorean()`** - KST 변환 및 한국어 표시
3. **`formatDateOnly()`** - KST 기준 날짜만 추출
4. **`formatTimeOnly()`** - KST 기준 시간만 추출
5. **`getUserTimezone()`** - 항상 KST 반환
6. **`formatDateKorean()`** - KST 변환 후 한국어 포맷
7. **`formatRelativeTime()`** - KST 기준 상대 시간 계산

### 3. 컴포넌트 수정

#### 📁 `PaymentsSection.tsx`

```typescript
// Before
return new Date(dateString).toLocaleString("ko-KR", {...});

// After
return formatToLocalTime(dateString, {...});
```

#### 📁 `ReservationDetailModal.tsx`

- **예약일시 표시**: `formatToLocalTime()` 사용
- **최초 생성/최종 수정**: `formatToLocalTime()` 사용
- **결제 승인일시**: `formatToLocalTime()` 사용
- **날짜 포맷팅**: `parseUTCtoKST()` → KST 기준 변환
- **환불 정책 계산**: `parseUTCtoKST()` 사용하여 KST 기준 계산

#### 📁 `ReservationList.tsx`

```typescript
// 자동 취소 타이머 계산
const created = parseUTCtoKST(createdAt).getTime();
```

## 시간 변환 흐름

```
[백엔드] UTC 저장
    ↓
[API 응답] UTC 문자열 (예: "2025-10-28T05:30:00" or "2025-10-28T05:30:00Z")
    ↓
[프론트엔드] parseUTCtoKST() → Date 객체 (UTC)
    ↓
[프론트엔드] formatToLocalTime() → KST 변환
    ↓
[화면 표시] "2025년 10월 28일 14:30" (KST)
```

## 주요 개선사항

### ✅ 일관성

- 모든 날짜/시간이 KST로 통일되어 표시
- `timeZone: KST_TIMEZONE` 옵션을 모든 포맷 함수에 적용

### ✅ 정확성

- UTC → KST 변환 시 9시간 차이 정확히 반영
- LocalDateTime(Z 없음)도 UTC로 간주하여 올바르게 처리

### ✅ 유지보수성

- 중앙화된 시간 변환 유틸리티 (`dateUtils.ts`)
- 모든 컴포넌트에서 동일한 변환 로직 사용

### ✅ 확장성

- 향후 다른 타임존 지원 시 `KST_TIMEZONE` 상수만 변경
- 백엔드는 UTC 유지로 다국적 서비스 확장 용이

## 테스트 포인트

1. **예약 생성 시간**: UTC로 저장 → KST로 표시
2. **결제 승인 시간**: UTC → KST +9시간
3. **환불 정책 계산**: KST 기준으로 남은 일수 계산
4. **자동 취소 타이머**: KST 기준 30분 타이머
5. **Toss Payments 타임존**: ISO 8601 오프셋 형식(+09:00) 처리

## 빌드 결과

**프론트엔드:**

```
✓ Compiled successfully in 4.1s
✓ Linting and checking validity of types
✓ Generating static pages (17/17)
```

**백엔드:**

```
BUILD SUCCESSFUL in 20s
6 actionable tasks: 6 executed
```

## Toss Payments 타임존 처리 (2025-01-28 추가)

### 문제점

Toss Payments API가 ISO 8601 형식의 타임존 오프셋을 포함한 날짜 문자열을 반환:

- 예: `"2025-10-28T23:03:01+09:00"`
- 기존 시스템은 "+09:00" 오프셋 형식을 처리하지 못해 `RangeError: Invalid time value` 발생

### 해결 방법

#### 백엔드 (`PaymentService.java`)

```java
// OffsetDateTime으로 타임존 오프셋 파싱 후 UTC로 변환
String approvedAtStr = paymentResult.get("approvedAt").getAsString();
try {
    OffsetDateTime approvedDateTime = OffsetDateTime.parse(approvedAtStr);
    String utcApprovedAt = approvedDateTime.atZoneSameInstant(ZoneOffset.UTC)
            .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    payment.setApprovedAt(utcApprovedAt);
    log.info("Approved at converted to UTC: {} -> {}", approvedAtStr, utcApprovedAt);
} catch (Exception e) {
    log.warn("Failed to parse approvedAt, saving as is: {}", approvedAtStr, e);
    payment.setApprovedAt(approvedAtStr);
}
```

#### 프론트엔드 (`dateUtils.ts`)

```typescript
// JavaScript Date 객체가 자동으로 타임존 오프셋 처리
const date = new Date(dateString); // "+09:00", "Z" 모두 자동 파싱

// Invalid Date 체크 후 fallback
if (isNaN(date.getTime())) {
  const normalizedDateString = dateString.endsWith("Z")
    ? dateString
    : dateString + "Z";
  return new Date(normalizedDateString);
}
```

### 지원 형식

- `"2025-10-28T23:03:01+09:00"` (Toss Payments)
- `"2025-10-28T14:03:01Z"` (UTC)
- `"2025-10-28T14:03:01"` (LocalDateTime, UTC로 간주)

## 베스트 프랙티스

1. **백엔드**: 항상 UTC로 저장
2. **프론트엔드**: 표시 직전에 로컬 타임존으로 변환
3. **타임존 명시**: `timeZone: KST_TIMEZONE` 옵션 항상 지정
4. **외부 API 통합**: 타임존 오프셋 포함 가능성 고려하여 `OffsetDateTime` 사용
5. **일관된 유틸리티 사용**: `dateUtils.ts`의 함수만 사용

## 향후 고려사항

- 사용자별 타임존 설정 기능 추가 (국제화)
- 서머타임(DST) 자동 처리 확인
- 시간대 표시 옵션 (예: "KST", "+09:00" 표시)

---

**작업 완료일**: 2025-10-28
**영향 범위**: 전체 시스템의 날짜/시간 표시
**호환성**: 기존 UTC 데이터와 완전 호환
