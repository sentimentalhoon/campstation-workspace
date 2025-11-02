# 프론트엔드 거리 계산 및 캐싱 가이드

## 📍 개요

사용자의 현재 위치와 캠핑장 간의 거리를 계산하고 캐시하여 자원을 효율적으로 사용합니다.  
**프론트엔드에서 거리를 계산하고 메모리 캐시**에 저장하여 반복 계산을 방지합니다.

## 🎯 핵심 기능

### 1. 거리 계산
- **Haversine 공식** 사용하여 두 좌표 간의 거리 계산
- 지구의 곡률을 고려한 정확한 거리 계산
- 소수점 첫째자리까지 표시 (예: 12.5km)

### 2. 예상 소요 시간 계산
- **평균 속도**: 고속도로 기준 80km/h
- **자동 계산**: 거리 기반 자동 계산
- **포맷**: "2시간 30분" 또는 "45분"

### 3. 메모리 캐싱
- **TTL (Time To Live)**: 5분
- **캐시 데이터**: 거리 + 예상 소요 시간
- **캐시 키 전략**: `dist_{campgroundId}_{roundedLat}_{roundedLon}`
  - 사용자 위치를 소수점 3자리로 반올림 (약 100m 정확도)
  - 캐시 히트율 향상을 위한 최적화
- **자동 정리**: 5분마다 만료된 캐시 자동 삭제

### 3. 사용자 위치 관리
- **sessionStorage 캐시**: 페이지 새로고침 시에도 위치 유지
- **위치 캐시 TTL**: 10분
- **자동 fetch 옵션**: 필요시 자동으로 위치 가져오기
- **에러 처리**: 권한 거부, 위치 불가, 타임아웃 등 처리

## 📂 파일 구조

```
frontend/
├── src/
│   ├── utils/
│   │   └── distanceCalculator.ts          # 거리 계산 및 캐싱 유틸리티
│   ├── hooks/
│   │   └── useUserLocation.ts             # 사용자 위치 관리 훅
│   ├── components/
│   │   ├── campgrounds/
│   │   │   └── CampgroundCard.tsx         # 캠핑장 카드 (거리 표시)
│   │   └── home/
│   │       └── sections/
│   │           ├── FeaturedCampgroundSection.tsx  # 추천 캠핑장 섹션
│   │           └── HeroSection.tsx        # 히어로 섹션 (위치 버튼)
│   └── app/
│       └── campgrounds/
│           └── CampgroundsClient.tsx      # 캠핑장 목록 페이지
└── DISTANCE_CALCULATION_GUIDE.md          # 이 문서
```

## 🔧 구현 상세

### 1. 거리 계산 유틸리티 (`distanceCalculator.ts`)

#### 주요 함수

```typescript
// 두 좌표 간의 거리 계산 (Haversine 공식)
calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number

// 거리 기반 예상 소요 시간 계산 (80km/h 기준)
calculateTravelTime(distanceKm: number): string

// 캠핑장과 사용자 간의 거리 + 소요 시간 계산 (캐시 활용)
getDistanceAndTimeToCampground(campground: CampgroundLocation, userLat: number, userLon: number): { distance: number; travelTime: string }

// 캠핑장과 사용자 간의 거리만 계산 (캐시 활용) - 하위 호환성
getDistanceToCampground(campground: CampgroundLocation, userLat: number, userLon: number): number

// 여러 캠핑장의 거리를 일괄 계산
calculateDistancesForCampgrounds(campgrounds: CampgroundLocation[], userLat: number, userLon: number): Map<number, number>

// 거리를 사람이 읽기 쉬운 형식으로 변환 (예: 12.5km, 500m)
formatDistance(distanceKm: number): string
```

#### 캐시 전략

```typescript
// 캐시 구조
interface DistanceCache {
  [key: string]: {
    distance: number;     // 킬로미터
    travelTime: string;   // 예상 소요 시간 (예: "2시간 30분")
    timestamp: number;    // 캐시 저장 시간
  };
}

// 캐시 키 생성
function getCacheKey(campgroundId: number, userLat: number, userLon: number): string {
  const roundedLat = Math.round(userLat * 1000) / 1000;  // 소수점 3자리
  const roundedLon = Math.round(userLon * 1000) / 1000;
  return `dist_${campgroundId}_${roundedLat}_${roundedLon}`;
}

// 캐시 저장
setDistanceAndTimeToCache(campgroundId, userLat, userLon, distance, travelTime);

// 캐시 조회
const cached = getDistanceAndTimeFromCache(campgroundId, userLat, userLon);
// 반환: { distance: number, travelTime: string } | null
```

#### 자동 캐시 정리

```typescript
// 5분마다 만료된 캐시 자동 정리
setInterval(clearExpiredDistanceCache, 5 * 60 * 1000);
```

### 2. 사용자 위치 훅 (`useUserLocation.ts`)

```typescript
// 사용 예시
const { userLocation, isLoading, error, requestLocation } = useUserLocation(autoFetch);

// userLocation: { lat: number, lng: number } | null
// isLoading: boolean - 위치 요청 중 여부
// error: string | null - 에러 메시지
// requestLocation: () => void - 수동 위치 요청 함수
```

#### 위치 캐싱

```typescript
// sessionStorage에 저장
interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

// TTL: 10분
const LOCATION_CACHE_TTL = 10 * 60 * 1000;
```

### 3. 컴포넌트 통합

#### FeaturedCampgroundSection

```tsx
const { userLocation } = useUserLocation(false);

// 거리 계산 (캐시 활용)
const distanceMap = useMemo(() => {
  if (!userLocation) return null;
  
  return calculateDistancesForCampgrounds(
    campgrounds.map(c => ({ id: c.id, latitude: c.latitude, longitude: c.longitude })),
    userLocation.lat,
    userLocation.lng
  );
}, [campgrounds, userLocation]);

// 카드에 전달
<CampgroundCard
  campground={campground}
  distance={distanceMap?.get(campground.id)}
/>
```

#### KakaoMap (거리 + 소요 시간)

```tsx
import {
  calculateDistance,
  calculateTravelTime,
  getDistanceAndTimeFromCache,
  setDistanceAndTimeToCache,
} from "@/utils/distanceCalculator";

// 캐시 확인
const cached = getDistanceAndTimeFromCache(tempId, userLat, userLng);

if (cached) {
  // 캐시된 데이터 사용
  setDistance(formatDistance(cached.distance));
  setTravelTime(cached.travelTime);
} else {
  // 새로 계산
  const distanceKm = calculateDistance(userLat, userLng, campLat, campLng);
  const timeString = calculateTravelTime(distanceKm);
  
  // 캐시에 저장
  setDistanceAndTimeToCache(tempId, userLat, userLng, distanceKm, timeString);
}
```

#### HeroSection (위치 요청 버튼)

```tsx
const { userLocation, isLoading, error, requestLocation } = useUserLocation(false);

// 위치 없을 때: "내 위치에서 거리 보기" 버튼
// 위치 있을 때: "거리 표시 중" 배지
// 에러 발생 시: 에러 메시지 표시
```

## 📊 성능 최적화

### 캐시 효율성

1. **메모리 캐시**: 빠른 읽기/쓰기 (O(1))
2. **위치 반올림**: 약 100m 정확도로 캐시 히트율 향상
   - 예: (37.5446123, 127.0377456) → (37.545, 127.038)
3. **자동 정리**: 5분마다 만료된 캐시 삭제로 메모리 관리

### 계산 최적화

```typescript
// Haversine 공식 - 한 번만 계산
const distance = calculateDistance(lat1, lon1, lat2, lon2);  // ~0.1ms

// 소요 시간 계산 - 간단한 수식
const travelTime = calculateTravelTime(distance);  // ~0.01ms

// 캐시 조회 - 즉시 반환 (거리 + 소요 시간)
const cached = getDistanceAndTimeFromCache(campgroundId, lat, lon);  // ~0.01ms
```

### 배치 처리

```typescript
// 여러 캠핑장 거리 + 소요 시간 일괄 계산
const distances = calculateDistancesForCampgrounds(
  campgrounds,  // 10개 캠핑장
  userLat,
  userLon
);
// 첫 실행: ~1.5ms (10개 계산: 거리 + 소요 시간)
// 캐시 히트: ~0.1ms (10개 조회: 거리 + 소요 시간)
```

## 🎨 UI/UX

### 거리 표시 형식

```typescript
// 1km 미만: 미터로 표시
formatDistance(0.5) // "500m"

// 1km 이상 10km 미만: 소수점 첫째자리
formatDistance(5.8) // "5.8km"

// 10km 이상: 반올림
formatDistance(12.7) // "13km"
```

### 캠핑장 카드

```tsx
{distance !== undefined && (
  <p className="mt-0.5 text-xs font-semibold text-success">
    📍 {formatDistance(distance)} 거리
  </p>
)}
```

### Featured 섹션 카드

```tsx
{distance !== undefined && (
  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white">
    📍 {formatDistance(distance)}
  </span>
)}
```

## 🔍 사용 시나리오

### 시나리오 1: 홈페이지 방문

1. 사용자가 홈페이지 방문
2. "내 위치에서 거리 보기" 버튼 표시
3. 사용자가 버튼 클릭
4. 브라우저 위치 권한 요청
5. 위치 허용 시:
   - sessionStorage에 위치 저장
   - 모든 캠핑장 거리 계산 및 캐시
   - 거리 정보 표시

### 시나리오 2: 캠핑장 목록 페이지

1. 캠핑장 목록 로드
2. 캐시된 사용자 위치 확인
3. 위치가 있으면:
   - 각 캠핑장 거리 계산 (캐시 활용)
   - 거리 정보와 함께 카드 표시
4. 위치가 없으면:
   - 거리 정보 없이 카드 표시

### 시나리오 3: 페이지 새로고침

1. 페이지 새로고침
2. sessionStorage에서 위치 로드 (TTL 확인)
3. 위치가 유효하면:
   - 즉시 거리 정보 표시
   - 캐시된 거리 사용 (5분 TTL)
4. 위치가 만료되었으면:
   - 거리 정보 숨김
   - 사용자가 다시 위치 버튼 클릭 필요

## ⚠️ 에러 처리

### 위치 권한 거부

```typescript
case GeolocationPositionError.PERMISSION_DENIED:
  setError("위치 권한이 거부되었습니다.");
```

### 위치 불가

```typescript
case GeolocationPositionError.POSITION_UNAVAILABLE:
  setError("위치 정보를 사용할 수 없습니다.");
```

### 타임아웃

```typescript
case GeolocationPositionError.TIMEOUT:
  setError("위치 요청 시간이 초과되었습니다.");
```

### 성능 지표

### 거리 + 소요 시간 계산

| 작업 | 시간 | 설명 |
|-----|-----|-----|
| Haversine 계산 | ~0.1ms | 거리 계산 |
| 소요 시간 계산 | ~0.01ms | 시간 계산 |
| 캐시 조회 | ~0.01ms | 거리 + 시간 캐시 히트 |
| 10개 배치 계산 | ~1.5ms | 첫 실행 (거리 + 시간) |
| 10개 배치 조회 | ~0.1ms | 캐시 히트 (거리 + 시간) |

### 메모리 사용

- 캠핑장 1개당 캐시 크기: ~60 bytes (거리 + 소요 시간 포함)
- 100개 캠핑장 캐시: ~6KB
- 만료된 캐시 자동 정리로 메모리 효율성 유지

## 🚀 향후 개선 사항

1. **거리 기반 정렬**: 가까운 순으로 캠핑장 정렬
2. **거리 필터**: "5km 이내" 등의 필터 추가
3. **지도 통합**: 지도에 거리 정보 표시 ✅ (완료: KakaoMap 통합)
4. **최적 경로**: Google Maps 연동으로 실제 이동 시간 표시
5. **IndexedDB 활용**: 더 긴 TTL의 영구 캐시
6. **교통 상황 반영**: 실시간 교통 정보 기반 소요 시간 계산

## 📝 참고사항

### Haversine 공식

```
a = sin²(Δφ/2) + cos φ1 · cos φ2 · sin²(Δλ/2)
c = 2 · atan2(√a, √(1−a))
d = R · c
```

- φ: 위도 (latitude)
- λ: 경도 (longitude)
- R: 지구 반지름 (6371km)
- d: 두 점 간의 거리

### 좌표 정확도

| 소수점 자리 | 정확도 |
|-----------|-------|
| 0 | ~111km |
| 1 | ~11km |
| 2 | ~1.1km |
| 3 | ~110m ✅ (사용) |
| 4 | ~11m |
| 5 | ~1.1m |

### 브라우저 지원

- Geolocation API: 모든 최신 브라우저 지원
- sessionStorage: IE8+ 포함 모든 브라우저 지원
- 모바일 브라우저: iOS Safari, Android Chrome 모두 지원

## 🔗 관련 문서

- [CAMPGROUND_IMAGE_CACHE_GUIDE.md](../CAMPGROUND_IMAGE_CACHE_GUIDE.md) - 이미지 캐싱 전략
- [CACHE_EVICTION_IMPROVEMENTS.md](../CACHE_EVICTION_IMPROVEMENTS.md) - 캐시 무효화 전략
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
