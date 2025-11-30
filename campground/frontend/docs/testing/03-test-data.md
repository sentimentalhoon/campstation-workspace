# 테스트 데이터 가이드

> 테스트 데이터 생성 및 관리 가이드

## 📋 목차

1. [테스트 데이터 원칙](#테스트-데이터-원칙)
2. [Seed 데이터 관리](#seed-데이터-관리)
3. [Mock API 데이터](#mock-api-데이터)
4. [테스트 계정 관리](#테스트-계정-관리)
5. [데이터 클린업](#데이터-클린업)

---

## 📐 테스트 데이터 원칙

### 1. 독립성 (Isolation)

**원칙**: 각 테스트는 독립적인 데이터를 사용해야 함

```typescript
// ❌ 나쁜 예: 공유 데이터 사용
const SHARED_USER = { email: "test@example.com", password: "123456" };

test("test1", async () => {
  await login(SHARED_USER); // test2에서 변경하면 영향받음
});

// ✅ 좋은 예: 독립적인 데이터 생성
test("test1", async () => {
  const user = createTestUser(); // 고유한 사용자 생성
  await login(user);
});
```

### 2. 재현성 (Reproducibility)

**원칙**: 언제 실행해도 같은 결과

```typescript
// ❌ 나쁜 예: 현재 날짜 의존
const checkinDate = new Date(); // 매일 다른 결과

// ✅ 좋은 예: 상대적 날짜
const checkinDate = addDays(new Date(), 14); // 항상 2주 후
```

### 3. 최소성 (Minimalism)

**원칙**: 테스트에 필요한 최소한의 데이터만

```typescript
// ❌ 나쁜 예: 불필요한 데이터 많음
const campground = {
  id: 1,
  name: '테스트 캠핑장',
  description: '매우 긴 설명...',
  facilities: ['전기', '화장실', '샤워실', ...], // 30개
  reviews: [...100개 리뷰],
  // ... 50개 필드
};

// ✅ 좋은 예: 필요한 필드만
const campground = {
  id: 1,
  name: '테스트 캠핑장',
  pricePerNight: 50000,
};
```

---

## 🌱 Seed 데이터 관리

### Backend Seed Data

**backend/src/test/resources/data.sql**:

```sql
-- 테스트 사용자
INSERT INTO users (id, email, password, name, phone, role, created_at)
VALUES
  (1, 'test@example.com', '$2a$10$hashed_password', '테스트사용자', '010-1234-5678', 'USER', NOW()),
  (2, 'admin@example.com', '$2a$10$hashed_password', '관리자', '010-9999-9999', 'ADMIN', NOW());

-- 테스트 캠핑장
INSERT INTO campgrounds (id, name, region, address, description, price_per_night, latitude, longitude, created_at)
VALUES
  (1, '테스트 캠핑장', '강원도', '강원도 춘천시 테스트로 123', '테스트용 캠핑장입니다', 50000, 37.8813, 127.7298, NOW()),
  (2, '서울 캠핑장', '서울', '서울시 강남구 테스트로 456', '서울 테스트 캠핑장', 80000, 37.4979, 127.0276, NOW()),
  (3, '부산 캠핑장', '부산', '부산시 해운대구 테스트로 789', '부산 테스트 캠핑장', 60000, 35.1796, 129.0756, NOW());

-- 캠핑장 편의시설
INSERT INTO campground_facilities (campground_id, facility)
VALUES
  (1, '전기'),
  (1, '화장실'),
  (1, '샤워실'),
  (1, '와이파이');

-- 캠핑 사이트
INSERT INTO sites (id, campground_id, site_number, site_type, max_capacity)
VALUES
  (1, 1, 'A-1', 'AUTO', 4),
  (2, 1, 'A-2', 'AUTO', 4),
  (3, 1, 'B-1', 'GLAMPING', 6);

-- 테스트 예약
INSERT INTO reservations (id, user_id, campground_id, site_id, checkin_date, checkout_date, guests_adults, guests_children, total_price, status, created_at)
VALUES
  (1, 1, 1, 1, DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 16 DAY), 2, 1, 100000, 'CONFIRMED', NOW());

-- 리뷰
INSERT INTO reviews (id, user_id, campground_id, reservation_id, rating, content, created_at)
VALUES
  (1, 1, 1, 1, 5, '정말 좋은 캠핑장이었어요!', NOW());
```

### Seed 데이터 로딩

**application-test.yml**:

```yaml
spring:
  sql:
    init:
      mode: always
      data-locations: classpath:data.sql
  jpa:
    hibernate:
      ddl-auto: create-drop
```

---

## 🎭 Mock API 데이터

### MSW (Mock Service Worker) 설정

**src/mocks/handlers.ts**:

```typescript
import { rest } from "msw";

export const handlers = [
  // 캠핑장 목록
  rest.get("/api/v1/campgrounds", (req, res, ctx) => {
    const region = req.url.searchParams.get("region");

    let campgrounds = mockCampgrounds;
    if (region) {
      campgrounds = campgrounds.filter((c) => c.region === region);
    }

    return res(
      ctx.status(200),
      ctx.json({
        content: campgrounds,
        totalElements: campgrounds.length,
        totalPages: 1,
      })
    );
  }),

  // 캠핑장 상세
  rest.get("/api/v1/campgrounds/:id", (req, res, ctx) => {
    const { id } = req.params;
    const campground = mockCampgrounds.find((c) => c.id === Number(id));

    if (!campground) {
      return res(ctx.status(404), ctx.json({ message: "Not found" }));
    }

    return res(ctx.status(200), ctx.json(campground));
  }),

  // 예약 생성
  rest.post("/api/v1/reservations", async (req, res, ctx) => {
    const body = await req.json();

    const reservation = {
      id: Math.floor(Math.random() * 1000),
      ...body,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    return res(ctx.status(201), ctx.json(reservation));
  }),

  // 로그인
  rest.post("/api/v1/auth/login", async (req, res, ctx) => {
    const { email, password } = await req.json();

    if (email === "test@example.com" && password === "Test1234!") {
      return res(
        ctx.status(200),
        ctx.json({
          accessToken: "mock_access_token",
          user: {
            id: 1,
            email: "test@example.com",
            name: "테스트사용자",
          },
        }),
        ctx.cookie("refreshToken", "mock_refresh_token", {
          httpOnly: true,
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({ message: "이메일 또는 비밀번호가 올바르지 않습니다" })
    );
  }),
];
```

### Mock 데이터 정의

**src/mocks/data/campgrounds.ts**:

```typescript
export const mockCampgrounds = [
  {
    id: 1,
    name: "테스트 캠핑장",
    region: "강원도",
    address: "강원도 춘천시 테스트로 123",
    description: "아름다운 자연과 함께하는 캠핑장",
    pricePerNight: 50000,
    latitude: 37.8813,
    longitude: 127.7298,
    imageUrls: [
      "https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=Campground+1",
      "https://via.placeholder.com/800x600/2196F3/FFFFFF?text=Campground+2",
    ],
    facilities: ["전기", "화장실", "샤워실", "와이파이"],
    sites: [
      { id: 1, siteNumber: "A-1", type: "AUTO", maxCapacity: 4 },
      { id: 2, siteNumber: "A-2", type: "AUTO", maxCapacity: 4 },
    ],
    rating: 4.5,
    reviewCount: 42,
  },
  {
    id: 2,
    name: "서울 캠핑장",
    region: "서울",
    address: "서울시 강남구 테스트로 456",
    description: "도심 속 힐링 캠핑장",
    pricePerNight: 80000,
    latitude: 37.4979,
    longitude: 127.0276,
    imageUrls: [
      "https://via.placeholder.com/800x600/FF5722/FFFFFF?text=Seoul+Camp",
    ],
    facilities: ["전기", "화장실", "샤워실"],
    sites: [{ id: 3, siteNumber: "B-1", type: "GLAMPING", maxCapacity: 6 }],
    rating: 4.8,
    reviewCount: 128,
  },
  {
    id: 3,
    name: "부산 캠핑장",
    region: "부산",
    address: "부산시 해운대구 테스트로 789",
    description: "바다가 보이는 캠핑장",
    pricePerNight: 60000,
    latitude: 35.1796,
    longitude: 129.0756,
    imageUrls: [
      "https://via.placeholder.com/800x600/00BCD4/FFFFFF?text=Busan+Camp",
    ],
    facilities: ["전기", "화장실"],
    sites: [{ id: 4, siteNumber: "C-1", type: "AUTO", maxCapacity: 4 }],
    rating: 4.3,
    reviewCount: 56,
  },
];
```

---

## 👤 테스트 계정 관리

### 계정 유형별 구분

| 계정 유형       | 이메일             | 비밀번호   | 역할  | 용도             |
| --------------- | ------------------ | ---------- | ----- | ---------------- |
| **일반 사용자** | test@example.com   | Test1234!  | USER  | 일반 기능 테스트 |
| **관리자**      | admin@example.com  | Admin1234! | ADMIN | 관리 기능 테스트 |
| **신규 가입**   | (동적 생성)        | Test1234!  | USER  | 회원가입 테스트  |
| **소셜 로그인** | social@example.com | -          | USER  | OAuth 테스트     |

### 계정 생성 헬퍼

**e2e/utils/test-users.ts**:

```typescript
export function createTestUser() {
  return {
    email: `test-${Date.now()}@example.com`,
    password: "Test1234!",
    name: "테스트사용자",
    phone: "010-1234-5678",
  };
}

export function getTestUser(type: "user" | "admin" = "user") {
  if (type === "admin") {
    return {
      email: "admin@example.com",
      password: "Admin1234!",
    };
  }

  return {
    email: "test@example.com",
    password: "Test1234!",
  };
}
```

### 계정 초기화 스크립트

**scripts/reset-test-accounts.sh**:

```bash
#!/bin/bash

# Docker 컨테이너에서 실행
docker exec campstation-postgres psql -U campstation -d campstation << EOF
  -- 테스트 계정 삭제
  DELETE FROM users WHERE email LIKE 'test-%@example.com';

  -- 기본 테스트 계정 재생성
  INSERT INTO users (email, password, name, phone, role)
  VALUES
    ('test@example.com', '$2a$10$hashed_password', '테스트사용자', '010-1234-5678', 'USER'),
    ('admin@example.com', '$2a$10$hashed_password', '관리자', '010-9999-9999', 'ADMIN')
  ON CONFLICT (email) DO NOTHING;
EOF

echo "Test accounts reset successfully!"
```

---

## 🧹 데이터 클린업

### 테스트 후 정리

**전략 1: 각 테스트 후 삭제**

```typescript
import { test, expect } from "@playwright/test";

test.afterEach(async ({ page, request }) => {
  // 생성된 예약 삭제
  const reservationId = page.url().match(/reservations\/(\d+)/)?.[1];
  if (reservationId) {
    await request.delete(`/api/v1/reservations/${reservationId}`);
  }
});

test("예약 생성", async ({ page }) => {
  // 예약 생성 테스트
  // afterEach에서 자동 삭제됨
});
```

**전략 2: 테스트 DB 초기화**

```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve("./e2e/global-setup.ts"),
  globalTeardown: require.resolve("./e2e/global-teardown.ts"),
});
```

**e2e/global-setup.ts**:

```typescript
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default async function globalSetup() {
  console.log("Setting up test database...");

  // 테스트 DB 초기화
  await execAsync("npm run db:reset:test");

  // Seed 데이터 로딩
  await execAsync("npm run db:seed:test");
}
```

**e2e/global-teardown.ts**:

```typescript
export default async function globalTeardown() {
  console.log("Cleaning up test data...");

  // 필요시 추가 정리 작업
}
```

---

### 자동 정리 설정

**Backend 설정 (application-test.yml)**:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop # 테스트 종료 시 DB 삭제
  sql:
    init:
      mode: always
```

---

## 🎲 랜덤 데이터 생성

### Faker 사용

**설치**:

```bash
npm install -D @faker-js/faker
```

**사용 예시**:

```typescript
import { faker } from "@faker-js/faker/locale/ko";

export function createRandomCampground() {
  return {
    name: `${faker.location.city()} 캠핑장`,
    region: faker.location.state(),
    address: faker.location.streetAddress(),
    description: faker.lorem.paragraph(),
    pricePerNight: faker.number.int({ min: 30000, max: 100000 }),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
  };
}

export function createRandomReservation() {
  const checkinDate = faker.date.future();
  const checkoutDate = new Date(checkinDate);
  checkoutDate.setDate(checkinDate.getDate() + 2);

  return {
    campgroundId: faker.number.int({ min: 1, max: 10 }),
    checkinDate,
    checkoutDate,
    guestsAdults: faker.number.int({ min: 1, max: 4 }),
    guestsChildren: faker.number.int({ min: 0, max: 3 }),
  };
}
```

---

## 📊 테스트 데이터 상태 관리

### 데이터 상태 추적

**src/mocks/state.ts**:

```typescript
// 메모리 내 상태 관리 (MSW)
export const testState = {
  users: [] as User[],
  campgrounds: mockCampgrounds,
  reservations: [] as Reservation[],

  reset() {
    this.users = [];
    this.reservations = [];
    this.campgrounds = [...mockCampgrounds];
  },

  addUser(user: User) {
    this.users.push(user);
  },

  findUser(email: string) {
    return this.users.find((u) => u.email === email);
  },
};

// 테스트 전 초기화
beforeEach(() => {
  testState.reset();
});
```

---

## 📝 베스트 프랙티스

### 1. 테스트 데이터 버전 관리

```
src/mocks/
├── data/
│   ├── v1/
│   │   ├── campgrounds.ts
│   │   └── users.ts
│   └── v2/
│       ├── campgrounds.ts
│       └── users.ts
└── handlers.ts
```

### 2. 환경별 데이터 분리

```typescript
// src/mocks/data/index.ts
const isCI = process.env.CI === "true";

export const mockData = isCI
  ? require("./ci-data") // CI: 최소 데이터
  : require("./dev-data"); // 로컬: 풍부한 데이터
```

### 3. 데이터 검증

```typescript
import { z } from "zod";

const CampgroundSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  pricePerNight: z.number().positive(),
  // ...
});

export const mockCampgrounds = [
  CampgroundSchema.parse({
    id: 1,
    name: "테스트 캠핑장",
    pricePerNight: 50000,
  }),
];
```

---

## 📌 다음 단계

- [E2E 테스트 시나리오](./02-e2e-scenarios.md) - 실제 테스트 작성
- [QA 체크리스트](./04-qa-checklist.md) - 수동 테스트
- [테스트 전략](./01-test-strategy.md) - 전략 개요
