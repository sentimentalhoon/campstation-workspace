# ADMIN 대시보드 테스트 가이드

**날짜**: 2025-11-13  
**목적**: ADMIN 역할로 대시보드 접속 및 기능 테스트

---

## 📋 사전 준비 사항

### 1. ADMIN 계정 준비

#### 방법 1: 백엔드에서 계정 생성

```sql
-- 기존 계정을 ADMIN으로 변경
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

#### 방법 2: 신규 ADMIN 계정 생성

백엔드 API를 통해 신규 계정 생성 후 역할 변경

**필요 정보**:

- Email: admin@example.com
- Password: (설정)
- Role: ADMIN

### 2. 로그인

```
1. http://localhost:3001/login 접속
2. 이메일/비밀번호 로그인 또는 OAuth2 로그인
3. 로그인 성공 확인
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 대시보드 접근 권한 테스트

#### Step 1: MEMBER 역할로 접속 시도

**목적**: 권한 검증 확인

**절차**:

1. MEMBER 역할 계정으로 로그인
2. `/dashboard/admin` 직접 접속

**기대 결과**:

- [ ] `/error/403` 페이지로 리다이렉트
- [ ] "접근 권한이 없습니다" 메시지 표시
- [ ] "홈으로" 버튼 작동

#### Step 2: ADMIN 역할로 접속

**절차**:

1. ADMIN 역할 계정으로 로그인
2. `/dashboard/admin` 접속

**기대 결과**:

- [ ] 대시보드 페이지 정상 표시
- [ ] 로딩 상태 표시 후 데이터 로드

---

### 시나리오 2: 통계 데이터 표시

#### 2.1 사용자 통계

**API**: `GET /v1/admin/stats`

**확인 사항**:

- [ ] **전체 사용자** 카드
  - [ ] 숫자 표시 (예: 150명)
  - [ ] Users 아이콘 표시

- [ ] **이번달 신규** 카드
  - [ ] 숫자 표시 (예: 25명)
  - [ ] TrendingUp 아이콘 표시

- [ ] **역할별 사용자** 카드
  - [ ] MEMBER 수 (예: 120명)
  - [ ] OWNER 수 (예: 25명)
  - [ ] ADMIN 수 (예: 5명)

#### 2.2 캠핑장 통계

**확인 사항**:

- [ ] **전체 캠핑장** 카드
  - [ ] 숫자 표시 (예: 77개)
  - [ ] Store 아이콘 표시

- [ ] **승인 대기** 카드
  - [ ] 숫자 표시 (예: 5개)
  - [ ] Clock 아이콘 표시
  - [ ] 주황색 강조 (pending 상태)

- [ ] **이번달 신규** 카드
  - [ ] 숫자 표시 (예: 10개)

#### 2.3 예약 통계

**확인 사항**:

- [ ] **전체 예약** 카드
  - [ ] 숫자 표시 (예: 500건)
  - [ ] Calendar 아이콘 표시

- [ ] **이번달 예약** 카드
  - [ ] 숫자 표시 (예: 80건)

- [ ] **취소율** 카드
  - [ ] 퍼센트 표시 (예: 5%)

#### 2.4 수익 통계

**확인 사항**:

- [ ] **총 수익** 카드
  - [ ] 금액 표시 (예: ₩50,000,000)
  - [ ] DollarSign 아이콘 표시

- [ ] **이번달 수익** 카드
  - [ ] 금액 표시 (예: ₩8,000,000)

- [ ] **성장률** 카드
  - [ ] 퍼센트 표시 (예: +15%)
  - [ ] 증가/감소 표시

#### 2.5 신고 통계

**확인 사항**:

- [ ] **전체 신고** 카드
  - [ ] 숫자 표시 (예: 30건)
  - [ ] AlertTriangle 아이콘 표시

- [ ] **처리 대기** 카드
  - [ ] 숫자 표시 (예: 5건)
  - [ ] 빨간색 강조

---

### 시나리오 3: 차트 렌더링

#### 3.1 사용자 증가 추세 차트

**컴포넌트**: `<TrendChart />`

**확인 사항**:

- [ ] 제목: "사용자 증가 추세 (최근 7일)"
- [ ] X축: 날짜 (MM/DD 형식)
- [ ] Y축: 사용자 수
- [ ] 라인 차트 표시
- [ ] 데이터 포인트 표시
- [ ] 호버 시 툴팁 표시

**예상 데이터 구조**:

```javascript
[
  { date: "11/04", value: 145 },
  { date: "11/05", value: 147 },
  { date: "11/06", value: 148 },
  // ...
];
```

#### 3.2 매출 추세 차트

**컴포넌트**: `<TrendChart />`

**확인 사항**:

- [ ] 제목: "매출 추세 (최근 7일)"
- [ ] X축: 날짜
- [ ] Y축: 매출 (원)
- [ ] 라인 차트 표시
- [ ] 금액 포맷 (₩1,000,000)

#### 3.3 역할별 분포 차트

**컴포넌트**: `<DistributionChart />`

**확인 사항**:

- [ ] 제목: "역할별 사용자 분포"
- [ ] 파이 차트 또는 도넛 차트
- [ ] 항목:
  - [ ] MEMBER (파란색)
  - [ ] OWNER (초록색)
  - [ ] ADMIN (주황색)
- [ ] 퍼센트 표시
- [ ] 범례 표시

#### 3.4 예약 상태 분포 차트

**컴포넌트**: `<DistributionChart />`

**확인 사항**:

- [ ] 제목: "예약 상태별 분포"
- [ ] 파이 차트
- [ ] 항목:
  - [ ] CONFIRMED (초록색)
  - [ ] PENDING (노란색)
  - [ ] CANCELLED (빨간색)
- [ ] 퍼센트 표시

#### 3.5 캠핑장 승인 상태 차트

**컴포넌트**: `<ComparisonChart />`

**확인 사항**:

- [ ] 제목: "캠핑장 승인 상태"
- [ ] 막대 차트
- [ ] 항목:
  - [ ] APPROVED (초록색)
  - [ ] PENDING (주황색)
  - [ ] REJECTED (빨간색)
- [ ] 수량 표시

---

### 시나리오 4: 최근 활동

#### 4.1 활동 목록 표시

**API**: `GET /v1/admin/activities?limit=10`

**확인 사항**:

- [ ] 제목: "최근 활동"
- [ ] 최대 10개 활동 표시
- [ ] 각 활동 항목:
  - [ ] 활동 타입 아이콘
  - [ ] 설명 텍스트
  - [ ] 사용자 정보 (있는 경우)
  - [ ] 타임스탬프 (상대 시간)

#### 4.2 활동 타입별 아이콘

**확인 사항**:

- [ ] USER_REGISTERED: Users 아이콘 (파란색)
- [ ] CAMPGROUND_CREATED: Store 아이콘 (초록색)
- [ ] RESERVATION_MADE: Calendar 아이콘 (주황색)
- [ ] REVIEW_POSTED: Star 아이콘 (노란색)
- [ ] REPORT_FILED: AlertTriangle 아이콘 (빨간색)

#### 4.3 활동 예시

```
👤 user123님이 회원가입했습니다 (5분 전)
🏕️ 새로운 캠핑장 "강릉 바다캠핑장"이 등록되었습니다 (10분 전)
📅 예약 #1234가 생성되었습니다 (15분 전)
⭐ 새로운 리뷰가 작성되었습니다 (20분 전)
⚠️ 신고가 접수되었습니다 (30분 전)
```

---

### 시나리오 5: 네비게이션 및 링크

#### 5.1 사이드바 메뉴

**확인 사항**:

- [ ] "사용자 관리" 링크 → `/dashboard/admin/users`
- [ ] "예약 관리" 링크 → `/dashboard/admin/reservations`
- [ ] "캠핑장 관리" 링크 → `/dashboard/admin/campgrounds`
- [ ] "신고 관리" 링크 → `/dashboard/admin/reports`

#### 5.2 통계 카드 클릭

**확인 사항**:

- [ ] "승인 대기" 카드 클릭 → 승인 대기 캠핑장 목록
- [ ] "처리 대기 신고" 카드 클릭 → 처리 대기 신고 목록

---

### 시나리오 6: 반응형 디자인

#### 6.1 모바일 (< 640px)

**확인 사항**:

- [ ] 통계 카드 1열 배치
- [ ] 차트 가로 스크롤 또는 세로 배치
- [ ] 사이드바 햄버거 메뉴로 변경

#### 6.2 태블릿 (640px ~ 1024px)

**확인 사항**:

- [ ] 통계 카드 2열 배치
- [ ] 차트 적절한 크기

#### 6.3 데스크톱 (> 1024px)

**확인 사항**:

- [ ] 통계 카드 2~4열 배치
- [ ] 차트 최적 크기
- [ ] 사이드바 고정

---

### 시나리오 7: 에러 처리

#### 7.1 API 에러

**시뮬레이션**:

1. 백엔드 서버 중지
2. 페이지 새로고침

**기대 결과**:

- [ ] 에러 메시지 표시: "통계를 불러오는데 실패했습니다"
- [ ] "다시 시도" 버튼 표시
- [ ] 버튼 클릭 시 재시도

#### 7.2 401 Unauthorized

**시뮬레이션**:

1. localStorage에서 토큰 삭제
2. 페이지 새로고침

**기대 결과**:

- [ ] 자동 토큰 갱신 시도
- [ ] 갱신 실패 시 `/error/401` 리다이렉트

#### 7.3 로딩 상태

**확인 사항**:

- [ ] 데이터 로딩 중 스피너 표시
- [ ] "통계 불러오는 중..." 메시지
- [ ] 로딩 완료 후 데이터 표시

---

## 🔍 디버깅 도구

### 1. React DevTools

#### AdminDashboardPage 컴포넌트 확인

```
컴포넌트 트리:
- AdminDashboardPage
  - StatsCard (여러 개)
  - TrendChart (2개)
  - DistributionChart (2개)
  - ComparisonChart (1개)
  - RecentActivities
```

#### State 확인

```javascript
// useAdminStats Hook
{
  stats: {
    users: { total, members, owners, admins, newThisMonth },
    campgrounds: { total, approved, pending, rejected, newThisMonth },
    reservations: { total, thisMonth, confirmed, cancelled },
    revenue: { total, thisMonth, growth },
    reports: { total, pending, approved, rejected }
  },
  activities: [...],
  isLoading: false,
  error: null
}
```

### 2. Network 탭

**확인할 요청**:

- `GET /v1/admin/stats`
  - Status: 200
  - Response Time: < 100ms
  - Response: JSON 통계 데이터

- `GET /v1/admin/activities?limit=10`
  - Status: 200
  - Response: 최근 활동 배열

**헤더 확인**:

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### 3. Console

**유용한 명령어**:

```javascript
// 현재 통계 데이터 확인
window.adminStats;

// 로컬 스토리지 토큰 확인
localStorage.getItem("campstation-auth-token");

// API 직접 호출 테스트
fetch("http://localhost:8080/api/v1/admin/stats", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("campstation-auth-token")}`,
  },
})
  .then((r) => r.json())
  .then(console.log);
```

---

## 📊 테스트 결과 기록

### 통계 카드

| 카드        | 표시   | 아이콘 | 데이터 정확성 |
| ----------- | ------ | ------ | ------------- |
| 전체 사용자 | [ ] OK | [ ] OK | [ ] OK        |
| 이번달 신규 | [ ] OK | [ ] OK | [ ] OK        |
| 전체 캠핑장 | [ ] OK | [ ] OK | [ ] OK        |
| 승인 대기   | [ ] OK | [ ] OK | [ ] OK        |
| 전체 예약   | [ ] OK | [ ] OK | [ ] OK        |
| 이번달 예약 | [ ] OK | [ ] OK | [ ] OK        |
| 총 수익     | [ ] OK | [ ] OK | [ ] OK        |
| 이번달 수익 | [ ] OK | [ ] OK | [ ] OK        |
| 전체 신고   | [ ] OK | [ ] OK | [ ] OK        |
| 처리 대기   | [ ] OK | [ ] OK | [ ] OK        |

### 차트

| 차트             | 렌더링 | 데이터 | 인터랙션 |
| ---------------- | ------ | ------ | -------- |
| 사용자 증가 추세 | [ ] OK | [ ] OK | [ ] OK   |
| 매출 추세        | [ ] OK | [ ] OK | [ ] OK   |
| 역할별 분포      | [ ] OK | [ ] OK | [ ] OK   |
| 예약 상태 분포   | [ ] OK | [ ] OK | [ ] OK   |
| 캠핑장 승인 상태 | [ ] OK | [ ] OK | [ ] OK   |

### 최근 활동

| 항목           | 결과   |
| -------------- | ------ |
| 활동 목록 표시 | [ ] OK |
| 타입별 아이콘  | [ ] OK |
| 타임스탬프     | [ ] OK |

### 권한 검증

| 시나리오         | 결과   |
| ---------------- | ------ |
| MEMBER 접근 차단 | [ ] OK |
| ADMIN 접근 허용  | [ ] OK |
| 401 에러 처리    | [ ] OK |

---

## 🚨 알려진 이슈

### Issue 1: 차트 라이브러리 미설치

**증상**: 차트가 표시되지 않음

**원인**: Recharts 패키지 미설치

**해결**:

```bash
npm install recharts
```

### Issue 2: 통계 데이터 null

**증상**: 통계 카드에 "0" 또는 "-" 표시

**원인**: 백엔드에서 데이터 없음

**해결**:

1. 백엔드 데이터베이스 확인
2. 테스트 데이터 추가
3. 백엔드 통계 API 로직 확인

### Issue 3: 권한 검증 실패

**증상**: ADMIN 역할인데 403 에러

**원인**: JWT 토큰에 역할 정보 없음

**해결**:

1. 백엔드 JWT 발급 로직 확인
2. 토큰에 `role` 클레임 포함 확인
3. 프론트엔드 역할 검증 로직 확인

---

## 📝 참고사항

### ADMIN 기능 개요

```
ADMIN 대시보드
├── 통계 (Dashboard)
├── 사용자 관리 (Users)
├── 캠핑장 관리 (Campgrounds)
├── 예약 관리 (Reservations)
└── 신고 관리 (Reports)
```

### API 엔드포인트

```
GET  /v1/admin/stats                    # 전체 통계
GET  /v1/admin/activities?limit=10      # 최근 활동
GET  /v1/admin/users                    # 사용자 목록
GET  /v1/admin/campgrounds              # 캠핑장 목록
GET  /v1/admin/reservations             # 예약 목록
GET  /v1/admin/reports                  # 신고 목록
```

---

**작성일**: 2025-11-13  
**다음 단계**: Sprint 6 완료 및 Sprint 7 계획
