# React Query 캐싱 전략

> CampStation 프론트엔드의 데이터 캐싱 정책

## 📋 캐싱 원칙

### 1. staleTime (신선도 시간)

- 데이터가 "신선한(fresh)" 상태로 유지되는 시간
- 이 시간 내에는 refetch하지 않음
- 사용자 경험과 서버 부하의 균형점

### 2. gcTime (Garbage Collection Time, 구 cacheTime)

- 비활성 쿼리가 캐시에서 제거되기까지의 시간
- staleTime보다 길게 설정하여 뒤로가기 시 캐시 활용

### 3. 데이터 특성별 분류

#### ⚡ 실시간성 (staleTime: 30초 ~ 1분)

- 예약 가능 여부
- 찜 상태
- 예약 목록

#### 📊 준실시간성 (staleTime: 3 ~ 5분)

- 캠핑장 상세 정보
- 사이트 정보
- 리뷰 목록

#### 🏛️ 정적 데이터 (staleTime: 10 ~ 30분)

- 사용자 프로필
- 캠핑장 목록
- 편의시설 목록

---

## 📦 Hook별 캐싱 설정

### 인증 (Authentication)

#### `useUserProfile()`

```typescript
staleTime: 5 * 60 * 1000,  // 5분
gcTime: 10 * 60 * 1000,    // 10분
```

**이유**: 프로필 정보는 자주 변경되지 않음. 세션 유지 중 캐시 활용

---

### 캠핑장 (Campgrounds)

#### `useCampgrounds()` (목록)

```typescript
staleTime: 10 * 60 * 1000, // 10분
gcTime: 15 * 60 * 1000,    // 15분
```

**이유**: 캠핑장 기본 정보는 거의 변경되지 않음. 긴 캐시로 서버 부하 감소

#### `useCampgroundDetail()` (상세)

```typescript
staleTime: 5 * 60 * 1000,  // 5분
gcTime: 10 * 60 * 1000,    // 10분
```

**이유**: 상세 정보(리뷰 개수, 평점 등)는 준실시간 업데이트 필요

#### `useCampgroundSites()` (사이트 목록)

```typescript
staleTime: 3 * 60 * 1000,  // 3분
gcTime: 10 * 60 * 1000,    // 10분
```

**이유**: 예약 가능 여부 변경 가능성 고려

---

### 예약 (Reservations)

#### `useReservations()` (목록)

```typescript
staleTime: 1 * 60 * 1000,  // 1분
gcTime: 5 * 60 * 1000,     // 5분
```

**이유**: 예약 상태가 자주 변경될 수 있음 (확정/취소)

#### `useReservationDetail()` (상세)

```typescript
staleTime: 1 * 60 * 1000,  // 1분
gcTime: 5 * 60 * 1000,     // 5분
```

**이유**: 예약 상태 실시간 반영 필요

#### `useCreateReservation()` (생성)

```typescript
// Mutation - 성공 시 관련 쿼리 invalidate
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["reservations"] });
  queryClient.invalidateQueries({ queryKey: ["campgrounds"] });
};
```

---

### 리뷰 (Reviews)

#### `useReviews()` (캠핑장별 리뷰)

```typescript
staleTime: 5 * 60 * 1000,  // 5분
gcTime: 10 * 60 * 1000,    // 10분
```

**이유**: 리뷰는 자주 작성되지 않음. 중간 정도의 캐시

#### `useMyReviews()` (내 리뷰)

```typescript
staleTime: 3 * 60 * 1000,  // 3분
gcTime: 5 * 60 * 1000,     // 5분
```

**이유**: 직접 작성/수정 가능하므로 짧은 staleTime

#### `useCreateReview()`, `useUpdateReview()` (생성/수정)

```typescript
// Mutation - 성공 시 관련 쿼리 invalidate
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["reviews"] });
  queryClient.invalidateQueries({ queryKey: ["reviews", "my"] });
  queryClient.invalidateQueries({ queryKey: ["campgrounds", id] });
};
```

---

### 찜하기 (Favorites)

#### `useFavorites()` (찜 목록)

```typescript
staleTime: 2 * 60 * 1000,  // 2분
gcTime: 5 * 60 * 1000,     // 5분
```

**이유**: 사용자가 직접 추가/삭제하므로 짧은 staleTime

#### `useFavoriteStatus()` (찜 여부)

```typescript
staleTime: 1 * 60 * 1000,  // 1분
gcTime: 3 * 60 * 1000,     // 3분
```

**이유**: 낙관적 업데이트와 함께 사용. 빠른 동기화 필요

#### `useToggleFavorite()` (토글)

```typescript
// Mutation - 낙관적 업데이트
onMutate: async (campgroundId) => {
  await queryClient.cancelQueries({ queryKey: ['favorites', 'status', campgroundId] });
  const previousStatus = queryClient.getQueryData(['favorites', 'status', campgroundId]);
  queryClient.setQueryData(['favorites', 'status', campgroundId], (old) => !old);
  return { previousStatus };
},
onError: (err, variables, context) => {
  queryClient.setQueryData(['favorites', 'status', variables], context.previousStatus);
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['favorites'] });
}
```

---

### 이미지 (Images)

#### `useUploadImage()` (업로드)

```typescript
// Mutation - 즉시 사용, 캐싱 불필요
```

---

## 🔄 Invalidation 전략

### 1. Mutation 성공 시 자동 무효화

```typescript
// 예약 생성 → 예약 목록, 캠핑장 목록 무효화
useCreateReservation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["reservations"] });
    queryClient.invalidateQueries({ queryKey: ["campgrounds"] });
  },
});

// 리뷰 작성 → 리뷰 목록, 캠핑장 평점 무효화
useCreateReview({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["reviews"] });
    queryClient.invalidateQueries({ queryKey: ["campgrounds", campgroundId] });
  },
});
```

### 2. 페이지 포커스 시 재검증

```typescript
// 중요 데이터는 refetchOnWindowFocus: true (기본값)
// 정적 데이터는 refetchOnWindowFocus: false

useCampgrounds({
  refetchOnWindowFocus: false, // 캠핑장 목록은 변경 빈도 낮음
});

useReservations({
  refetchOnWindowFocus: true, // 예약 상태는 변경 가능성 높음
});
```

---

## 🎯 추천 설정 요약

| 데이터 유형   | staleTime | gcTime | refetchOnWindowFocus |
| ------------- | --------- | ------ | -------------------- |
| 사용자 프로필 | 5분       | 10분   | false                |
| 캠핑장 목록   | 10분      | 15분   | false                |
| 캠핑장 상세   | 5분       | 10분   | true                 |
| 사이트 목록   | 3분       | 10분   | true                 |
| 예약 목록     | 1분       | 5분    | true                 |
| 예약 상세     | 1분       | 5분    | true                 |
| 리뷰 목록     | 5분       | 10분   | false                |
| 내 리뷰       | 3분       | 5분    | true                 |
| 찜 목록       | 2분       | 5분    | true                 |
| 찜 상태       | 1분       | 3분    | true                 |

---

## 📊 모니터링 포인트

### 1. 캐시 히트율

- React Query Devtools로 확인
- staleTime이 너무 길면 오래된 데이터 표시
- staleTime이 너무 짧으면 불필요한 API 호출

### 2. 네트워크 요청 빈도

- 같은 페이지 재방문 시 캐시 사용 확인
- 불필요한 refetch 최소화

### 3. 사용자 경험

- 로딩 스피너 노출 빈도
- 데이터 최신성

---

## 🔧 구현 예정

- [ ] `useCampgrounds` Hook에 최적화된 캐싱 설정 추가
- [ ] `useReviews` Hook에 캐싱 설정 추가
- [ ] `useFavorites` 전체 Hook에 일관된 캐싱 적용
- [ ] 모든 Mutation Hook에 적절한 invalidation 추가
- [ ] refetchOnWindowFocus 전략 적용
- [ ] React Query Provider의 기본 설정 수정

---

## 📖 참고 문서

- React Query Docs: https://tanstack.com/query/latest/docs/framework/react/guides/caching
- `05-STATE-MANAGEMENT.md` - 상태 관리 가이드
