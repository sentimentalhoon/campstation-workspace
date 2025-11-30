# Frontend-Backend API Integration

## Overview

프론트엔드가 백엔드 REST API와 완전히 통합되었습니다.

## Changes Made

### 1. API Service Layer (`src/services/api.js`)

백엔드 API와 통신하는 서비스 레이어 생성:

- `fetchBlacklists(filters)` - 필터링된 블랙리스트 목록 조회
- `fetchStats()` - 통계 데이터 조회
- `fetchBlacklistById(id)` - 단일 블랙리스트 상세 조회
- `createBlacklist(data)` - 새 블랙리스트 등록

### 2. HomeView.vue 업데이트

- Mock 데이터 제거 및 API 통합
- Loading/Error 상태 처리
- 실시간 필터링 (watch 사용)
- Stats API 통합

주요 변경사항:

```javascript
// Before (Mock)
const blacklistData = ref([...mockData]);

// After (API)
const blacklistData = ref([]);
onMounted(() => {
  loadBlacklists();
  loadStats();
});
```

### 3. BlacklistDetailView.vue 업데이트

- Mock 데이터 제거 및 API 통합
- Loading/Error 상태 처리
- 404 에러 핸들링
- 자동 조회수 증가 (백엔드에서 처리)

### 4. RegisterBlacklistView.vue 업데이트

- POST API 통합
- 제출 상태 관리 (isSubmitting)
- 에러 핸들링
- 성공 시 detail 페이지로 리다이렉트

### 5. Environment Configuration

`.env` 파일 생성:

```
VITE_API_URL=http://localhost:8081/api
```

## API Endpoints

### GET /api/blacklist

블랙리스트 목록 조회 (필터링, 정렬, 페이징 지원)

**Query Parameters:**

- `region` - 지역 필터
- `dangerLevel` - 위험도 필터 (위험/경고/주의)
- `search` - 검색어
- `sortBy` - 정렬 (latest/views/danger)
- `page` - 페이지 번호 (default: 1)
- `limit` - 페이지당 항목 수 (default: 20)

**Response:**

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

### GET /api/blacklist/stats

통계 데이터 조회

**Response:**

```json
{
  "total": 100,
  "danger": 30,
  "warning": 50,
  "caution": 20
}
```

### GET /api/blacklist/{id}

단일 블랙리스트 상세 조회 (자동 조회수 증가)

**Response:**

```json
{
  "id": "uuid",
  "name": "김**",
  "age": 23,
  ...
}
```

### POST /api/blacklist

새 블랙리스트 등록

**Request Body:**

```json
{
  "name": "홍길동",
  "age": 25,
  "gender": "남성",
  "phone": "010-1234-5678",
  "region": "서울",
  "pcCafe": "게임존 PC방",
  "dangerLevel": "경고",
  "reason": "기물 파손",
  "description": "상세 설명 (최소 20자)",
  "images": []
}
```

**Validation:**

- `age` ≥ 19
- `phone` 필수
- `description` ≥ 20자

**Response:**

```json
{
  "id": "generated-uuid",
  "name": "홍**",
  "phone": "010-****-5678",
  ...
}
```

## Running the Application

### 1. Start Backend (Ktor)

```bash
cd backend
./gradlew run
# or on Windows
gradlew.bat run
```

Backend will run on `http://localhost:8081`

### 2. Start Frontend (Vue)

```bash
cd community-frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## Testing

### Test API Endpoints

```bash
# Get blacklists
curl http://localhost:8081/api/blacklist

# Get stats
curl http://localhost:8081/api/blacklist/stats

# Get single item
curl http://localhost:8081/api/blacklist/1

# Create blacklist
curl -X POST http://localhost:8081/api/blacklist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트",
    "age": 25,
    "gender": "남성",
    "phone": "010-1234-5678",
    "region": "서울",
    "pcCafe": "테스트 PC방",
    "dangerLevel": "경고",
    "reason": "테스트",
    "description": "테스트용 상세 설명입니다. 최소 20자 이상 작성해야 합니다.",
    "images": []
  }'
```

## Features

### Data Masking

- 이름: `홍길동` → `홍**`
- 전화번호: `010-1234-5678` → `010-****-5678`

### Filtering & Sorting

- Region filter (17 regions)
- Danger level filter
- Search (name, pcCafe, description)
- Sort by latest/views/danger

### Pagination

- Default: 20 items per page
- Configurable page size

### Validation

- Age ≥ 19
- Phone number required
- Description ≥ 20 characters

### Error Handling

- Loading states
- Error messages
- Retry functionality
- 404 handling

## Mock Data Fallback

백엔드 서비스는 Redis 연결 실패 시 자동으로 Mock 데이터를 반환합니다:

- 5개의 샘플 블랙리스트 항목
- 실제 데이터와 동일한 구조

## Next Steps

1. ✅ Frontend-Backend API Integration
2. ⏳ Image Upload Implementation (multipart/form-data)
3. ⏳ User Authentication (JWT)
4. ⏳ Admin Review System
5. ⏳ Real-time Notifications

## Notes

- 모든 API 호출은 CORS가 활성화되어 있습니다
- Redis 연결이 필요하지만 실패 시 Mock 데이터 사용
- 이미지는 현재 Base64 URL로 전송 (추후 파일 업로드 구현 예정)
