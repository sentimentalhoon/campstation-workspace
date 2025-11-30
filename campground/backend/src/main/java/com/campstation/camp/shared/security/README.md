# Security Utilities

## 개요

Spring Security를 사용한 권한 검증을 간소화하기 위한 유틸리티 클래스 및 커스텀 어노테이션 모음입니다.

## 구성 요소

### 1. SecurityUtils

권한 검증을 위한 정적 헬퍼 메서드를 제공하는 유틸리티 클래스입니다.

#### 메서드

- `isOwnerOrAdmin(User user, Long ownerId)` - 사용자가 ADMIN이거나 지정된 소유자인지 확인
- `isResourceOwnerOrAdmin(User user, Ownable resource)` - 사용자가 ADMIN이거나 리소스의 소유자인지 확인
- `isAdmin(User user)` - 사용자가 ADMIN 권한을 가지고 있는지 확인
- `isOwner(User user)` - 사용자가 OWNER 권한을 가지고 있는지 확인
- `hasOwnerOrAdminRole(User user)` - 사용자가 OWNER 또는 ADMIN 권한을 가지고 있는지 확인

#### 사용 예시

```java
// 캠핑장 수정 권한 체크
var campground = campgroundService.getCampgroundEntityById(id);
if (!SecurityUtils.isOwnerOrAdmin(user, campground.getOwner().getId())) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(CommonResponse.error("권한이 없습니다."));
}

// ADMIN 권한 체크
if (SecurityUtils.isAdmin(user)) {
    // ADMIN 전용 로직
}

// Ownable 인터페이스를 구현한 리소스의 경우
if (!SecurityUtils.isResourceOwnerOrAdmin(user, resource)) {
    throw new AccessDeniedException("권한이 없습니다.");
}
```

### 2. Ownable 인터페이스

소유자 정보를 가진 리소스를 나타내는 마커 인터페이스입니다.

#### 구현 예시

```java
@Entity
public class Campground implements Ownable {

    @ManyToOne
    private User owner;

    @Override
    public User getOwner() {
        return owner;
    }
}
```

### 3. 커스텀 어노테이션

권한 체크를 위한 메타 어노테이션을 제공합니다.

#### @OwnerOrAdmin

OWNER 또는 ADMIN 권한이 필요한 메서드에 사용합니다.

```java
@OwnerOrAdmin
@PutMapping("/{id}")
public ResponseEntity<?> updateCampground(@PathVariable Long id, ...) {
    // ...
}
```

동등한 표현:

```java
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
```

#### @AdminOnly

ADMIN 권한만 필요한 메서드에 사용합니다.

```java
@AdminOnly
@GetMapping("/admin/dashboard")
public ResponseEntity<?> getAdminDashboard() {
    // ...
}
```

동등한 표현:

```java
@PreAuthorize("hasRole('ADMIN')")
```

#### @Authenticated

인증된 사용자만 접근 가능한 메서드에 사용합니다.

```java
@Authenticated
@GetMapping("/profile")
public ResponseEntity<?> getProfile() {
    // ...
}
```

동등한 표현:

```java
@PreAuthorize("isAuthenticated()")
```

## 사용 가이드

### 권한 체크 패턴

#### 1. Role 기반 체크 (어노테이션)

```java
@OwnerOrAdmin  // 또는 @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
public ResponseEntity<?> someMethod() {
    // Role 체크는 Spring Security가 자동으로 수행
}
```

#### 2. 실제 소유자 체크 (메서드 내부)

```java
@OwnerOrAdmin
public ResponseEntity<?> updateResource(@PathVariable Long id, Authentication auth) {
    var user = getUserFromAuth(auth);
    var resource = resourceService.findById(id);

    // SecurityUtils를 사용한 소유자 검증
    if (!SecurityUtils.isOwnerOrAdmin(user, resource.getOwner().getId())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(CommonResponse.error("권한이 없습니다."));
    }

    // 실제 로직
}
```

#### 3. 이중 권한 체크 (권장)

```java
@OwnerOrAdmin  // 1차: Role 체크
public ResponseEntity<?> updateResource(@PathVariable Long id, Authentication auth) {
    var user = getUserFromAuth(auth);
    var resource = resourceService.findById(id);

    // 2차: 실제 소유자 체크
    if (!SecurityUtils.isOwnerOrAdmin(user, resource.getOwner().getId())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(CommonResponse.error("권한이 없습니다."));
    }

    // 안전한 로직 수행
}
```

### 권한 계층

```
ADMIN > OWNER > USER
```

- **USER**: 일반 사용자 (예약, 리뷰 작성 등)
- **OWNER**: 캠핑장 소유자 (자신의 캠핑장 관리)
- **ADMIN**: 시스템 관리자 (모든 권한)

**중요**: OWNER가 접근 가능한 곳은 ADMIN도 접근 가능해야 합니다.

## 마이그레이션 가이드

### 기존 코드

```java
// Before
if (!user.getRole().name().equals("ADMIN") &&
    !campground.getOwner().getId().equals(user.getId())) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(CommonResponse.error("권한이 없습니다."));
}
```

### 개선된 코드

```java
// After
if (!SecurityUtils.isOwnerOrAdmin(user, campground.getOwner().getId())) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(CommonResponse.error("권한이 없습니다."));
}
```

## Best Practices

1. ✅ **이중 권한 체크**: 어노테이션으로 Role 체크 + 메서드 내부에서 실제 소유자 체크
2. ✅ **일관된 패턴 사용**: SecurityUtils 사용으로 코드 통일
3. ✅ **명확한 에러 메시지**: 권한 없음 시 구체적인 메시지 제공
4. ✅ **Null 체크**: SecurityUtils는 자동으로 null 체크 수행
5. ✅ **로깅**: 권한 체크 실패 시 로그 기록 (보안 감사용)

## 테스트

권한 체크 로직은 반드시 테스트해야 합니다:

```java
@Test
void testOwnerCanUpdateOwnCampground() {
    // Given
    var owner = createOwnerUser();
    var campground = createCampground(owner);

    // When
    boolean hasPermission = SecurityUtils.isOwnerOrAdmin(owner, campground.getOwner().getId());

    // Then
    assertTrue(hasPermission);
}

@Test
void testOwnerCannotUpdateOthersCampground() {
    // Given
    var owner1 = createOwnerUser();
    var owner2 = createOwnerUser();
    var campground = createCampground(owner2);

    // When
    boolean hasPermission = SecurityUtils.isOwnerOrAdmin(owner1, campground.getOwner().getId());

    // Then
    assertFalse(hasPermission);
}

@Test
void testAdminCanUpdateAnyCampground() {
    // Given
    var admin = createAdminUser();
    var owner = createOwnerUser();
    var campground = createCampground(owner);

    // When
    boolean hasPermission = SecurityUtils.isOwnerOrAdmin(admin, campground.getOwner().getId());

    // Then
    assertTrue(hasPermission);
}
```

## 참고

- Spring Security Documentation: https://spring.io/projects/spring-security
- @PreAuthorize: https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html
