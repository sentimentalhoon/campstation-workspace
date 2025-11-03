# 🔒 보안 및 권한 감사 리포트

**작성일**: 2025-11-03  
**프로젝트**: CampStation (캠핑장 예약 시스템)  
**심각도**: 🔴 HIGH - 즉각적인 조치 필요

---

## 📋 목차

1. [개요](#개요)
2. [발견된 주요 보안 문제](#발견된-주요-보안-문제)
3. [Controller별 권한 분석](#controller별-권한-분석)
4. [권한 규칙 정의](#권한-규칙-정의)
5. [수정 필요 사항 (TODO)](#수정-필요-사항-todo)
6. [프론트엔드 권한 체크](#프론트엔드-권한-체크)

---

## 개요

### 감사 범위
- ✅ 백엔드 Controller 권한 설정
- ✅ 프론트엔드 페이지 접근 제어
- ✅ 소유자 검증 로직
- ✅ ROLE 기반 접근 제어

### 심각도 분류
- 🔴 **CRITICAL**: 데이터 유출/변조 가능한 보안 취약점
- 🟡 **HIGH**: 권한 우회 가능한 문제
- 🟢 **MEDIUM**: 일관성 없는 권한 설정
- ⚪ **LOW**: 개선 권장 사항

---

## 발견된 주요 보안 문제

### 🔴 CRITICAL 문제

#### 1. SitePricingController - ADMIN 접근 차단
**위치**: `SitePricingController.java`  
**문제**: 모든 엔드포인트가 `@PreAuthorize("hasRole('OWNER')")` 사용
```java
@PreAuthorize("hasRole('OWNER')")  // ❌ ADMIN 접근 불가!
```

**영향**:
- ADMIN이 요금제 관리 불가
- 다른 Controller와 일관성 없음
- 관리자가 문제 해결 불가

**수정 필요**:
```java
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")  // ✅
```

#### 2. PaymentController - 혼재된 권한 규칙
**위치**: `PaymentController.java` line 141  
**문제**: `@PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")`
```java
// ❌ 비표준 문법 (다른 곳과 다름)
@PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")

// ✅ 표준 문법으로 통일 필요
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
```

#### 3. Owner/User 역할 혼동
**위치**: `PaymentController.java`  
**문제**: OWNER와 USER 권한이 혼재
```java
@PreAuthorize("hasRole('USER')")     // 일반 사용자 결제
@PreAuthorize("hasRole('OWNER')")    // 소유자 입금 확인
```

**명확화 필요**: 
- USER = 일반 예약자
- OWNER = 캠핑장 소유자
- 결제는 USER만 가능한가? OWNER도 예약할 수 있나?

### 🟡 HIGH 문제

#### 4. 실제 소유자 검증 누락
**검증된 Controller**:
- ✅ CampgroundController: 실제 소유자 체크 추가됨
- ✅ SiteController: 실제 소유자 체크 추가됨
- ✅ SitePricingController: 서비스 레벨에서 체크

**검증 필요**:
- ❓ OwnerController: 확인 필요
- ❓ ReservationController: 확인 필요
- ❓ PaymentController: 확인 필요
- ❓ ReviewController: 확인 필요

#### 5. 권한 체크 없는 Controller
**확인된 Controller** (grep 결과에 없음):
- ❓ AuthController: 공개 API (정상)
- ❓ UserController: 확인 필요
- ❓ FileController: 확인 필요
- ❓ AdminController: 확인 필요
- ❓ AdminDashboardController: 확인 필요
- ❓ AdminReservationController: 확인 필요
- ❓ CacheMonitoringController: 확인 필요
- ❓ RedisTestController: 확인 필요

### 🟢 MEDIUM 문제

#### 6. 일관성 없는 권한 체크 방식
```java
// 방식 1: hasAnyRole (권장)
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")

// 방식 2: or 연산자 (비권장)
@PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")

// 방식 3: isAuthenticated
@PreAuthorize("isAuthenticated()")
```

**표준화 필요**: `hasAnyRole` 사용 통일

---

## Controller별 권한 분석

### ✅ 올바르게 설정된 Controller

#### CampgroundController
```java
✅ createCampground:  @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
✅ updateCampground:  @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')") + 실제 소유자 체크
✅ deleteCampground:  @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')") + 실제 소유자 체크
✅ setMainImage:      @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
```

#### SiteController
```java
✅ createSite:   @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')") + 소유자 체크
✅ updateSite:   @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')") + 소유자 체크
✅ deleteSite:   @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')") + 소유자 체크
```

#### FavoriteController
```java
✅ 모든 엔드포인트: @PreAuthorize("isAuthenticated()")
```

### ❌ 수정 필요한 Controller

#### SitePricingController (🔴 CRITICAL)
```java
❌ createSitePricing:  @PreAuthorize("hasRole('OWNER')")
❌ getSitePricings:    @PreAuthorize("hasRole('OWNER')")
❌ updateSitePricing:  @PreAuthorize("hasRole('OWNER')")
❌ deleteSitePricing:  @PreAuthorize("hasRole('OWNER')")
❌ getAllOwnerPricings: @PreAuthorize("hasRole('OWNER')")

✅ 수정: hasAnyRole('OWNER', 'ADMIN')으로 변경 필요
```

#### PaymentController (🟡 HIGH)
```java
⚠️ processPayment:           @PreAuthorize("hasRole('USER')")
⚠️ getPaymentHistory:        @PreAuthorize("hasRole('USER')")
⚠️ getPaymentById:           @PreAuthorize("hasRole('USER')")
⚠️ requestRefund:            @PreAuthorize("hasRole('USER')")
❌ confirmDeposit:           @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
⚠️ requestConfirmation:      @PreAuthorize("hasRole('USER')")

🔍 검토 필요:
- USER만 결제 가능? OWNER도 예약 가능?
- "or" 문법을 hasAnyRole로 통일
- 소유자 검증 로직 필요 여부
```

### ❓ 확인 필요한 Controller

다음 Controller들의 권한 설정을 확인해야 합니다:

1. **UserController**
2. **FileController**
3. **OwnerController**
4. **AdminController**
5. **AdminDashboardController**
6. **AdminReservationController**
7. **CacheMonitoringController**
8. **ReviewController**
9. **ReservationController**

---

## 권한 규칙 정의

### 역할(Role) 정의

| Role | 설명 | 권한 범위 |
|------|------|----------|
| **USER** | 일반 사용자 | - 캠핑장 조회<br>- 예약 생성/조회<br>- 리뷰 작성<br>- 결제 |
| **OWNER** | 캠핑장 소유자 | - USER 권한 전체<br>- 자신의 캠핑장 관리<br>- 자신의 사이트 관리<br>- 요금제 관리<br>- 예약 확인/입금 확인 |
| **ADMIN** | 시스템 관리자 | - 모든 OWNER 권한<br>- 모든 캠핑장 관리<br>- 모든 사용자 관리<br>- 시스템 모니터링 |

### 권한 계층

```
ADMIN > OWNER > USER
```

**규칙**:
- OWNER가 접근 가능한 곳은 ADMIN도 접근 가능
- `@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")` 사용
- 단, ADMIN 전용 기능은 `@PreAuthorize("hasRole('ADMIN')")` 사용

### 소유자 검증

OWNER 권한이 있어도 **실제 소유자인지 검증** 필요:

```java
// 1. @PreAuthorize로 ROLE 체크
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")

// 2. 메서드 내부에서 실제 소유자 체크
if (!user.getRole().name().equals("ADMIN") && 
    !resource.getOwner().getId().equals(user.getId())) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(CommonResponse.error("권한이 없습니다."));
}
```

---

## 수정 필요 사항 (TODO)

### Phase 1: Critical 수정 (즉시)

- [ ] **TODO-1**: SitePricingController 모든 엔드포인트에 ADMIN 권한 추가
  - 파일: `SitePricingController.java`
  - 변경: `hasRole('OWNER')` → `hasAnyRole('OWNER', 'ADMIN')`
  - 영향: 5개 메서드

- [ ] **TODO-2**: PaymentController 권한 문법 통일
  - 파일: `PaymentController.java`
  - 변경: `hasRole('OWNER') or hasRole('ADMIN')` → `hasAnyRole('OWNER', 'ADMIN')`

### Phase 2: 권한 누락 확인 (긴급)

- [ ] **TODO-3**: UserController 권한 설정 확인 및 추가
- [ ] **TODO-4**: FileController 권한 설정 확인
  - 파일 업로드: OWNER/ADMIN만?
  - 파일 조회: Public?
  
- [ ] **TODO-5**: OwnerController 전체 검토
  - 모든 엔드포인트에 `@PreAuthorize` 확인
  - 실제 소유자 검증 로직 확인

- [ ] **TODO-6**: ReviewController 권한 설정 확인
  - 리뷰 작성: 인증된 사용자
  - 리뷰 수정/삭제: 작성자 본인
  - 리뷰 조회: Public

- [ ] **TODO-7**: ReservationController 권한 설정 확인
  - 예약 생성: USER
  - 예약 조회: 본인 예약만
  - 예약 취소: 본인 예약만
  - 게스트 예약: 별도 처리

### Phase 3: Admin 전용 기능 확인 (중요)

- [ ] **TODO-8**: AdminController 권한 확인
  - 모든 엔드포인트: `@PreAuthorize("hasRole('ADMIN')")`

- [ ] **TODO-9**: AdminDashboardController 권한 확인

- [ ] **TODO-10**: AdminReservationController 권한 확인

- [ ] **TODO-11**: CacheMonitoringController 권한 확인
  - 캐시 모니터링: ADMIN만

### Phase 4: 테스트 및 개발 환경 (낮음)

- [ ] **TODO-12**: RedisTestController 확인
  - 프로덕션에서 비활성화 필요
  - 또는 ADMIN 권한으로 제한

### Phase 5: 소유자 검증 추가 (중요)

- [ ] **TODO-13**: OwnerController에 실제 소유자 검증 추가
- [ ] **TODO-14**: PaymentController에 소유자 검증 추가
- [ ] **TODO-15**: ReservationController에 예약자 검증 추가
- [ ] **TODO-16**: ReviewController에 작성자 검증 추가

---

## 프론트엔드 권한 체크

### ✅ 수정 완료

1. **CampgroundDetailView.tsx**
   ```tsx
   ✅ isOwner = user?.role === "OWNER" && user?.id === initialCampground.owner.id
   ✅ isAdmin = user?.role === "ADMIN"
   ```

2. **캠핑장 수정 페이지** (`campgrounds/[id]/edit/page.tsx`)
   ```tsx
   ✅ 실제 소유자 검증
   ✅ ADMIN 또는 소유자만 접근
   ```

### ❓ 확인 필요

1. **사이트 관리 페이지**
   - 소유자 검증 필요
   
2. **요금제 관리 페이지**
   - 소유자 검증 필요
   - ADMIN 접근 가능 확인

3. **Owner Dashboard**
   - ADMIN도 접근 가능한지 확인

4. **Admin 페이지들**
   - ADMIN 전용 확인

---

## 권장 보안 개선 사항

### 1. 권한 체크 헬퍼 유틸리티

```java
public class SecurityUtils {
    public static boolean isOwnerOrAdmin(User user, Long ownerId) {
        return user.getRole() == Role.ADMIN || 
               user.getId().equals(ownerId);
    }
    
    public static boolean isResourceOwnerOrAdmin(User user, Ownable resource) {
        return user.getRole() == Role.ADMIN || 
               resource.getOwner().getId().equals(user.getId());
    }
}
```

### 2. 커스텀 어노테이션

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
public @interface OwnerOrAdmin {}

// 사용
@OwnerOrAdmin
public ResponseEntity<?> updateCampground(...) {
    // ...
}
```

### 3. AOP를 통한 자동 소유자 검증

```java
@Aspect
public class OwnershipAspect {
    @Before("@annotation(RequireOwnership)")
    public void checkOwnership(JoinPoint joinPoint) {
        // 자동으로 소유자 검증
    }
}
```

---

## 다음 단계

1. ✅ **이 문서 검토 및 승인**
2. 🔄 **Phase 1 (Critical) 즉시 수정**
3. 🔄 **Phase 2-3 순차적 수정**
4. 📝 **수정 후 테스트 케이스 작성**
5. 🚀 **프로덕션 배포 전 최종 검증**

---

## 체크리스트

### 백엔드 보안 체크리스트
- [ ] 모든 Controller에 `@PreAuthorize` 확인
- [ ] OWNER 권한에 ADMIN 추가
- [ ] 실제 소유자 검증 로직 추가
- [ ] 권한 문법 통일 (`hasAnyRole` 사용)
- [ ] 테스트용 Controller 프로덕션 제거/제한

### 프론트엔드 보안 체크리스트
- [ ] 페이지 접근 시 role 체크
- [ ] 버튼/링크 표시 시 소유자 체크
- [ ] API 호출 전 권한 체크
- [ ] 에러 처리 (401, 403)

---

**⚠️ 이 문서는 보안 감사 결과이므로 외부 공개 금지**
