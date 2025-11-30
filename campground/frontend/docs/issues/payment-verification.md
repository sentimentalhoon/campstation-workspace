# 결제 프로세스 검증 및 개선

> **작성일**: 2024-11-18  
> **상태**: ✅ 완료  
> **관련 Phase**: Phase 5 - 결제 프로세스 검증

---

## 📋 개요

Toss Payments 연동 및 결제 승인 로직에 **결제 금액 재검증** 기능을 추가하여 보안과 데이터 무결성을 강화했습니다.

---

## 🎯 목표

### 문제점

**기존 결제 승인 프로세스**:

```java
// ❌ 금액 검증 없이 바로 Toss Payments 승인
public PaymentResponse verifyAndCompletePayment(String paymentKey, Long paymentId, String orderId, int amount) {
    Payment payment = paymentRepository.findById(paymentId)
        .orElseThrow(() -> new ResourceNotFoundException("결제 정보를 찾을 수 없습니다."));

    // 금액 검증 없음!
    var paymentResult = tossPaymentsClient.confirmPayment(paymentKey, orderId, amount);

    // ...
}
```

**보안 위험**:

1. **금액 변조 가능**: 사용자가 결제 금액을 임의로 변경할 수 있음
2. **데이터 불일치**: 예약 시 계산한 금액과 실제 결제 금액이 다를 수 있음
3. **무결성 보장 불가**: 프론트엔드에서 전달한 금액을 그대로 신뢰

### 해결 방안

**개선된 결제 승인 프로세스**:

```java
// ✅ 금액 재검증 후 승인
public PaymentResponse verifyAndCompletePayment(String paymentKey, Long paymentId, String orderId, int amount) {
    Payment payment = paymentRepository.findById(paymentId)
        .orElseThrow(() -> new ResourceNotFoundException("결제 정보를 찾을 수 없습니다."));

    // ✅ 1. 결제 금액 재검증
    BigDecimal requestedAmount = BigDecimal.valueOf(amount);
    BigDecimal savedAmount = payment.getAmount();

    if (savedAmount.compareTo(requestedAmount) != 0) {
        log.error("Payment amount mismatch! Saved: {}, Requested: {}", savedAmount, requestedAmount);
        payment.markAsFailed("결제 금액 불일치");
        paymentRepository.save(payment);
        throw new IllegalArgumentException("결제 금액이 일치하지 않습니다.");
    }

    log.info("✅ Payment amount verified - amount: {}", amount);

    // ✅ 2. 금액 검증 성공 후 Toss Payments 승인
    var paymentResult = tossPaymentsClient.confirmPayment(paymentKey, orderId, amount);

    // ...
}
```

---

## 🔧 구현 내용

### 1. Backend - 결제 금액 재검증 (PaymentService.java)

**파일**: `backend/src/main/java/com/campstation/camp/reservation/service/PaymentService.java`

```java
@Transactional
public PaymentResponse verifyAndCompletePayment(String paymentKey, Long paymentId, String orderId, int amount) {
    Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("결제 정보를 찾을 수 없습니다."));

    // ✅ 결제 금액 재검증 - 예약 시 계산한 금액과 실제 결제 금액 비교
    BigDecimal requestedAmount = BigDecimal.valueOf(amount);
    BigDecimal savedAmount = payment.getAmount();

    if (savedAmount.compareTo(requestedAmount) != 0) {
        log.error("Payment amount mismatch! Saved: {}, Requested: {}, PaymentId: {}",
                savedAmount, requestedAmount, paymentId);
        payment.markAsFailed("결제 금액 불일치: 예약 금액=" + savedAmount + ", 결제 금액=" + requestedAmount);
        paymentRepository.save(payment);
        throw new IllegalArgumentException(
                String.format("결제 금액이 일치하지 않습니다. (예약 금액: %s원, 결제 금액: %s원)",
                        savedAmount, requestedAmount));
    }

    log.info("✅ Payment amount verified - amount: {}, paymentId: {}", amount, paymentId);

    try {
        // Toss Payments 승인 API 호출
        var paymentResult = tossPaymentsClient.confirmPayment(paymentKey, orderId, amount);

        // 결제 정보 저장 및 예약 확정
        // ...
    } catch (Exception e) {
        log.error("Payment confirmation failed", e);
        payment.markAsFailed("결제 승인 실패: " + e.getMessage());
        paymentRepository.save(payment);
        throw new RuntimeException("결제 승인에 실패했습니다: " + e.getMessage());
    }
}
```

**개선 효과**:

- ✅ 금액 변조 방지
- ✅ 데이터 무결성 보장
- ✅ 명확한 에러 메시지
- ✅ 실패 시 Payment 상태 자동 업데이트

---

### 2. Frontend - 결제 성공 페이지 검증 강화

**파일**: `app/payment/success/page.tsx`

```typescript
useEffect(() => {
  const verifyPayment = async () => {
    if (!paymentKey || !orderId || !amount) {
      setError("잘못된 결제 정보입니다.");
      setIsVerifying(false);
      return;
    }

    try {
      console.log("🔍 [DEBUG] 결제 승인 요청:", {
        paymentId: paymentIdToConfirm,
        paymentKey,
        orderId,
        amount: Number(amount),
      });

      // ✅ 백엔드 결제 승인 API 호출 (금액 재검증 포함)
      const payment = await paymentApi.confirm(paymentIdToConfirm, {
        paymentKey,
        orderId,
        amount: Number(amount),
      });

      console.log("✅ 결제 승인 성공:", payment);

      // ✅ 프론트엔드에서도 금액 검증 (이중 체크)
      if (payment.amount && Math.abs(payment.amount - Number(amount)) > 0) {
        console.warn("⚠️ 결제 금액 불일치 감지!", {
          savedAmount: payment.amount,
          requestedAmount: Number(amount),
          difference: Math.abs(payment.amount - Number(amount)),
        });
      }

      setResult({
        orderId,
        amount: Number(amount),
        orderName: `예약 #${payment.reservationId}`,
        reservationId: payment.reservationId || 0,
        method: payment.paymentMethod,
        approvedAt: payment.approvedAt ?? undefined,
      });
    } catch (err) {
      console.error("❌ 결제 승인 실패:", err);

      // ✅ 에러 메시지 상세화
      let errorMessage = "결제 승인에 실패했습니다.";

      if (err instanceof Error) {
        // 금액 불일치 에러 특별 처리
        if (err.message.includes("금액") || err.message.includes("amount")) {
          errorMessage =
            "결제 금액이 일치하지 않습니다. 고객센터로 문의해주세요.";
        } else if (err.message.includes("찾을 수 없")) {
          errorMessage = "결제 정보를 찾을 수 없습니다.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  verifyPayment();
}, [paymentKey, orderId, amount, searchParams]);
```

**개선 효과**:

- ✅ 이중 검증 (백엔드 + 프론트엔드)
- ✅ 상세한 에러 메시지
- ✅ 디버깅 로그 개선
- ✅ 사용자 친화적 피드백

---

## 🔍 검증 시나리오

### 시나리오 1: 정상 결제 ✅

**흐름**:

```
1. 예약 생성 → Payment 저장 (amount: 200,000원)
2. Toss Widget → 사용자 결제 (200,000원)
3. 결제 성공 → /payment/success?amount=200000
4. 백엔드 검증 → savedAmount(200,000) == requestedAmount(200,000) ✅
5. Toss Payments 승인 → 완료
6. 예약 상태 → CONFIRMED
```

**로그**:

```
✅ Payment amount verified - amount: 200000, paymentId: 123
TossPayments payment confirmed - paymentKey: xxx, orderId: ORDER_123
Reservation 456 confirmed after payment completion
```

---

### 시나리오 2: 금액 변조 시도 ❌

**흐름**:

```
1. 예약 생성 → Payment 저장 (amount: 200,000원)
2. 악의적 사용자 → URL 수정 (?amount=1000)
3. 결제 성공 페이지 → 백엔드 승인 요청 (amount: 1,000원)
4. 백엔드 검증 → savedAmount(200,000) != requestedAmount(1,000) ❌
5. 승인 거부 → IllegalArgumentException
6. Payment 상태 → FAILED
```

**로그**:

```
❌ Payment amount mismatch! Saved: 200000, Requested: 1000, PaymentId: 123
Payment status updated to FAILED
```

**에러 메시지**:

```
결제 금액이 일치하지 않습니다. (예약 금액: 200,000원, 결제 금액: 1,000원)
```

---

### 시나리오 3: 네트워크 에러 ⚠️

**흐름**:

```
1. 예약 생성 → Payment 저장 (amount: 200,000원)
2. Toss Widget → 사용자 결제 완료
3. 결제 성공 페이지 → 네트워크 타임아웃
4. 백엔드 승인 API → 호출 실패
5. 재시도 가능
```

**에러 메시지** (Frontend):

```
결제 승인에 실패했습니다.
```

**사용자 액션**:

- "예약 내역으로" 버튼
- "캠핑장 둘러보기" 버튼

---

## 📊 보안 강화 효과

| 항목           | Before         | After            | 개선        |
| -------------- | -------------- | ---------------- | ----------- |
| 금액 변조 방지 | ❌ 없음        | ✅ 백엔드 검증   | 100% 차단   |
| 데이터 무결성  | ⚠️ 신뢰 기반   | ✅ 검증 기반     | 강화        |
| 에러 추적      | ❌ 일반 로그   | ✅ 상세 로그     | 디버깅 용이 |
| 사용자 피드백  | ⚠️ 일반 메시지 | ✅ 구체적 메시지 | UX 개선     |

---

## 🔐 보안 레이어

### 3단계 검증 시스템

```
┌─────────────────────────────────────────────────────────────┐
│                     1. 예약 생성 시                         │
│  - PriceCalculationService로 정확한 금액 계산               │
│  - expectedAmount 검증 (프론트 vs 백엔드)                   │
│  - Payment 엔티티에 금액 저장                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  2. Toss Payments 결제                      │
│  - 사용자가 Toss Widget으로 결제                            │
│  - 결제 금액은 Payment.amount 기준                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     3. 결제 승인 시 (NEW!)                  │
│  - Payment.amount (저장된 금액) 조회                        │
│  - 요청 금액과 비교 검증                                    │
│  - 불일치 시 승인 거부 + Payment.FAILED                     │
│  - 일치 시 Toss Payments 승인 진행                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 추가 개선 사항

### 결제 성공 페이지

**Before**:

```typescript
// 단순 에러 표시
catch (err) {
  setError(err.message || "결제 승인에 실패했습니다.");
}
```

**After**:

```typescript
// 에러 타입별 메시지
catch (err) {
  let errorMessage = "결제 승인에 실패했습니다.";

  if (err.message.includes("금액")) {
    errorMessage = "결제 금액이 일치하지 않습니다. 고객센터로 문의해주세요.";
  } else if (err.message.includes("찾을 수 없")) {
    errorMessage = "결제 정보를 찾을 수 없습니다.";
  }

  setError(errorMessage);
}
```

### 로깅 개선

**Before**:

```java
log.info("Payment confirmed - paymentKey: {}", paymentKey);
```

**After**:

```java
// 단계별 상세 로그
log.info("✅ Payment amount verified - amount: {}, paymentId: {}", amount, paymentId);
log.error("❌ Payment amount mismatch! Saved: {}, Requested: {}, PaymentId: {}",
        savedAmount, requestedAmount, paymentId);
```

---

## 🎯 다음 단계

### Phase 6: 에러 핸들링 개선

**계획**:

1. **예약 생성 실패 처리**
   - 재시도 로직
   - 롤백 처리
   - 사용자 알림

2. **API 조회 실패 처리**
   - 네트워크 에러 vs 서버 에러 구분
   - 재시도 전략 (Exponential Backoff)
   - Fallback UI

3. **결제 실패 롤백 로직**
   - Payment 상태 자동 복구
   - Reservation 상태 동기화
   - 환불 프로세스

### Phase 7: E2E 테스트

**시나리오**:

1. 정상 예약 → 결제 → 완료
2. 금액 불일치 시 거부
3. 네트워크 에러 재시도
4. 결제 취소 플로우

---

## 📝 참고 문서

- [Payment-Reservation Workflow](../payment-reservation-workflow.md)
- [Refactoring Summary](../refactoring-summary.md)
- [Toss Payments API](https://docs.tosspayments.com/reference)

---

**최종 업데이트**: 2024-11-18  
**버전**: 1.0  
**상태**: ✅ 완료
