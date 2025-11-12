# 이미지 저장 방식 통일

## 개요

Campground, Review, Profile의 이미지 저장 방식을 모두 별도 테이블로 통일합니다.

## 변경 사항

### 1. 데이터베이스 구조

#### Before

- **Campground**: `campground_images` 테이블 (✅ 이미 올바름)
- **Review**: `reviews.images` JSONB 컬럼 (❌ 변경 필요)
- **Profile**: `users.profile_image` VARCHAR 컬럼 (❌ 변경 필요)

#### After

- **Campground**: `campground_images` 테이블
- **Review**: `review_images` 테이블 (신규 생성)
- **Profile**: `profile_images` 테이블 (신규 생성)

### 2. 신규 테이블 구조

#### review_images

```sql
CREATE TABLE review_images (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    original_url VARCHAR(500) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);
```

#### profile_images

```sql
CREATE TABLE profile_images (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    thumbnail_url VARCHAR(500) NOT NULL,
    original_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Backend 변경사항

#### 신규 엔티티

- `ReviewImage.java` - 리뷰 이미지 엔티티
- `ProfileImage.java` - 프로필 이미지 엔티티

#### 신규 Repository

- `ReviewImageRepository.java`
- `ProfileImageRepository.java`

#### 수정된 엔티티

- `Review.java`

  - `images` 필드: `String` (JSONB) → `List<ReviewImage>`
  - `@OneToMany` 관계 추가
  - `addImage()`, `removeImage()`, `clearImages()` 헬퍼 메서드 추가

- `User.java` (예정)
  - `profileImage` 필드: `String` → 제거
  - `@OneToOne` 관계 추가 (ProfileImage)

#### 공통 DTO

- `ImagePairDto.java` - 모든 이미지 응답에 사용
  ```java
  {
    thumbnailUrl: String,
    originalUrl: String
  }
  ```

#### 수정된 DTO

- `CreateReviewRequest.java`
  - `imagePaths` → `images` (ImagePairDto 리스트)
- `UpdateReviewRequest.java`
  - `imagePaths` → `images` (ImagePairDto 리스트)
  - `imagesToDelete` → `imageIdsToDelete` (이미지 ID 리스트)
- `ReviewResponse.java`
  - `images` 타입: `List<ReviewImagePath>` → `List<ImagePairDto>`

### 4. Frontend 변경사항

#### 신규 타입

- `types/domain/image.ts`
  ```typescript
  export type ImagePair = {
    thumbnailUrl: string;
    originalUrl: string;
  };
  ```

#### 수정된 타입

- `types/domain/review.ts`
  - `ReviewImage` 제거
  - `Review.images`: `ReviewImage[]` → `ImagePair[]`
  - `CreateReviewDto.images`: 통일된 `ImagePair[]`
  - `UpdateReviewDto.images`: 통일된 `ImagePair[]`
  - `UpdateReviewDto.imageIdsToDelete`: ID 기반 삭제

### 5. API 변경사항

#### FileController (예정)

리뷰 이미지 업로드 시 자동으로 썸네일 생성하여 `ImagePairDto` 형식으로 반환

#### ReviewService (예정)

- `createReview()`: ReviewImage 엔티티 생성 및 연관관계 설정
- `updateReview()`: ReviewImage 추가/삭제 처리
- `convertToResponse()`: ReviewImage → ImagePairDto 변환

## 마이그레이션 순서

1. ✅ 신규 엔티티 및 Repository 생성
2. ✅ 공통 DTO 생성 (ImagePairDto)
3. ✅ Review 엔티티 수정
4. ✅ DTO 수정 (Request/Response)
5. ✅ Frontend 타입 수정
6. ⏳ DB 마이그레이션 스크립트 실행
7. ⏳ ReviewService 로직 수정
8. ⏳ FileController 리뷰 이미지 업로드 엔드포인트 수정
9. ⏳ Frontend API/Hooks 수정
10. ⏳ User/ProfileImage 동일하게 적용

## 장점

1. **일관성**: 모든 이미지가 동일한 방식으로 저장됨
2. **확장성**: 이미지에 메타데이터 추가 용이 (display_order, alt_text 등)
3. **성능**: 인덱스 활용, 효율적인 조인
4. **유지보수성**: 통일된 구조로 코드 중복 감소
5. **타입 안정성**: 명확한 타입 정의

## 주의사항

- 기존 데이터 마이그레이션 필요 (실제 운영 데이터 있는 경우)
- images/profile_image 컬럼 삭제는 마이그레이션 완료 후 진행
