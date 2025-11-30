# 페이지별 상세 명세

> 각 페이지의 구성 요소 및 기능 상세

## 📱 페이지 구조

```
CampStation App
├── (auth)
│   ├── /login          - 로그인
│   └── /register       - 회원가입
├── /                   - 홈 (캠핑장 목록)
├── /campgrounds
│   ├── /               - 캠핑장 목록 (검색/필터)
│   └── /[id]          - 캠핑장 상세
├── /reservations
│   ├── /               - 내 예약 목록
│   ├── /[id]          - 예약 상세
│   ├── /new           - 새 예약 (날짜/사이트 선택)
│   └── /guest         - 비회원 예약 조회
├── /payment
│   └── /[id]          - 결제 페이지
├── /map               - 지도 검색
├── /reviews
│   ├── /new           - 리뷰 작성
│   └── /[id]/edit     - 리뷰 수정
└── /my
    ├── /               - 마이페이지 홈
    ├── /profile       - 프로필 수정
    ├── /favorites     - 찜 목록
    └── /reviews       - 내 리뷰
```

---

## 🔐 인증 페이지

### `/login` - 로그인 페이지

**상태**: ✅ 완료

#### 구성 요소

- **Header**: "로그인" 제목
- **Form**:
  - 이메일 입력 (`<Input type="email" />`)
  - 비밀번호 입력 (`<Input type="password" />`)
  - 로그인 버튼 (`<Button variant="primary" />`)
- **Links**:
  - 회원가입 링크
  - 비밀번호 찾기 (MVP 제외)
- **Divider**: "또는"
- **소셜 로그인** (MVP 제외):
  - 카카오 로그인 버튼
  - 네이버 로그인 버튼
  - 구글 로그인 버튼
  - 페이스북 로그인 버튼

#### 동작

1. 이메일/비밀번호 입력
2. 로그인 버튼 클릭
3. API 호출: `POST /v1/auth/login`
4. 성공 시:
   - 토큰 저장 (localStorage)
   - 홈으로 리다이렉션
5. 실패 시:
   - 에러 메시지 표시

#### Props / State

```typescript
{
  email: string;
  password: string;
  isLoading: boolean;
  error: string;
}
```

---

### `/register` - 회원가입 페이지

**상태**: ✅ 완료

#### 구성 요소

- **Header**: "회원가입" 제목
- **Form**:
  - 이메일 입력
  - 비밀번호 입력
  - 비밀번호 확인 입력
  - 이름 입력 (선택)
  - 전화번호 입력 (선택)
  - 회원가입 버튼
- **약관 동의** (MVP 제외)
- **Links**:
  - 이미 계정이 있으신가요? 로그인

#### 동작

1. 정보 입력 및 검증
   - 이메일 형식 검증
   - 비밀번호 일치 검증
2. 회원가입 버튼 클릭
3. API 호출: `POST /v1/auth/register`
4. 성공 시:
   - 자동 로그인
   - 홈으로 리다이렉션
5. 실패 시:
   - 에러 메시지 표시 (중복 이메일 등)

#### Props / State

```typescript
{
  email: string;
  password: string;
  passwordConfirm: string;
  name?: string;
  phone?: string;
  isLoading: boolean;
  error: string;
}
```

---

## 🏕️ 캠핑장 페이지

### `/` - 홈 (캠핑장 목록)

**상태**: ✅ 기본 완료

#### 구성 요소

- **Header**:
  - 로고
  - 검색 버튼 (아이콘)
  - 로그인/프로필 버튼
- **Hero Section** (선택):
  - 메인 타이틀
  - 서브 타이틀
  - 검색 바
- **Filter Bar** (MVP 제외):
  - 지역 선택
  - 날짜 선택
  - 인원 선택
- **Sort/Filter** (MVP 제외):
  - 정렬: 인기순/가격순/평점순
  - 필터 버튼
- **캠핑장 리스트**:
  - `<CampgroundCard />` 반복
  - 무한 스크롤 or 페이지네이션
- **Footer**

#### 동작

1. 페이지 로드 시 캠핑장 목록 조회
2. API 호출: `GET /v1/campgrounds?page=1&size=10`
3. 카드 클릭 시 상세 페이지로 이동

---

### `/campgrounds` - 캠핑장 목록 (검색/필터)

**상태**: ✅ 기본 완료, 필터링 미완

#### 구성 요소

- **Search Bar**:
  - 검색 입력
  - 검색 버튼
- **Active Filters** (선택한 필터 표시):
  - 필터 태그들
  - 전체 해제 버튼
- **Results Header**:
  - "000개의 캠핑장" 텍스트
  - 정렬 드롭다운
- **캠핑장 리스트**:
  - Grid or List 뷰
  - 페이지네이션

#### 동작

1. 검색어 입력
2. API 호출: `GET /v1/campgrounds?search=keyword&page=1`
3. 필터 변경 시 실시간 업데이트
4. 결과 없을 시: 빈 상태 표시

#### Query Params

```typescript
{
  search?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  facilities?: string[]; // MVP 제외
  theme?: string; // MVP 제외
  sort?: 'popular' | 'price' | 'rating'; // MVP 제외
  page: number;
  size: number;
}
```

---

### `/campgrounds/[id]` - 캠핑장 상세 페이지

**상태**: ⏳ 대기 (P0)

#### 구성 요소

- **Header**:
  - 뒤로가기 버튼
  - 찜 버튼 (하트 아이콘)
  - 공유 버튼 (MVP 제외)
- **Image Gallery**:
  - 메인 이미지 (스와이프 가능)
  - 이미지 인디케이터 (1/5)
- **Title Section**:
  - 캠핑장 이름
  - 평점 ★★★★☆ (4.5) + 리뷰 수
  - 위치 (시/도)
- **Quick Info**:
  - 체크인/체크아웃 시간
  - 전화번호 (클릭 시 전화걸기)
  - 주소 (클릭 시 지도 앱 열기)
- **Description**:
  - 캠핑장 소개
- **Facilities** (편의시설):
  - 아이콘 + 텍스트 그리드
  - 화장실, 샤워실, 전기, 와이파이 등
- **Sites** (캠핑 사이트):
  - 사이트 목록 카드
  - 사이트명, 가격, 수용인원, 예약가능 여부
- **Location**:
  - 미니 지도 (또는 지도 썸네일)
  - "지도에서 보기" 버튼
- **Reviews**:
  - 평균 평점 + 총 리뷰 수
  - 리뷰 3개 미리보기
  - "모든 리뷰 보기" 버튼
- **CTA Section**:
  - 가격 표시
  - "예약하기" 버튼 (sticky)

#### 동작

1. 페이지 로드 시 상세 정보 조회
2. API 호출: `GET /v1/campgrounds/{id}`
3. 찜 버튼 클릭: 찜 추가/제거
4. 예약하기 버튼 클릭: `/reservations/new?campgroundId={id}`로 이동

#### Data Structure

```typescript
{
  id: number;
  name: string;
  description: string;
  images: string[];
  location: {
    address: string;
    region: string;
    coordinates: { lat: number; lng: number };
  };
  contact: {
    phone: string;
    email?: string;
  };
  checkIn: string; // "14:00"
  checkOut: string; // "11:00"
  facilities: string[]; // ["화장실", "샤워실", "전기"]
  sites: CampSite[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
}
```

---

## 📅 예약 페이지

### `/reservations/new` - 새 예약 페이지

**상태**: ⏳ 대기 (P0)

#### 구성 요소

- **Header**:
  - 뒤로가기
  - "예약하기" 제목
- **Step Indicator**:
  - 1. 날짜 선택 → 2. 사이트 선택 → 3. 정보 입력 → 4. 결제
- **Step 1: 날짜 선택**:
  - 캘린더 컴포넌트
  - 체크인 날짜 선택
  - 체크아웃 날짜 선택
  - 박 수 자동 계산
- **Step 2: 사이트 선택**:
  - 사이트 카드 리스트
  - 사이트별 가격, 인원, 예약가능 표시
  - 선택 라디오 버튼
- **Step 3: 인원 입력**:
  - 성인 인원 (+/- 버튼)
  - 아동 인원 (+/- 버튼)
- **Step 4: 추가 정보** (MVP 제외):
  - 특별 요청사항 textarea
  - 추가 옵션 체크박스
- **Summary Section** (sticky bottom):
  - 선택한 정보 요약
  - 총 금액
  - "다음" 또는 "결제하기" 버튼

#### 동작

1. Query param으로 campgroundId 받음
2. 날짜 선택 시 사이트 예약 가능 여부 조회
   - `GET /v1/campgrounds/{id}/sites?checkIn={date}&checkOut={date}`
3. 모든 정보 입력 완료 시
4. 예약 생성: `POST /v1/reservations`
5. 결제 페이지로 이동: `/payment/{reservationId}`

#### Form State

```typescript
{
  campgroundId: number;
  checkIn: Date;
  checkOut: Date;
  siteId: number;
  adults: number;
  children: number;
  specialRequests?: string;
  options?: string[]; // MVP 제외
}
```

---

### `/reservations` - 내 예약 목록

**상태**: ⏳ 대기 (P0)

#### 구성 요소

- **Header**:
  - "내 예약" 제목
- **Tabs**:
  - 예정된 예약
  - 이용 완료
  - 취소됨
- **예약 카드 리스트**:
  - 캠핑장 이미지 (썸네일)
  - 캠핑장 이름
  - 예약 날짜 (YYYY.MM.DD - MM.DD)
  - 예약 상태 배지
  - 예약 번호
- **빈 상태**:
  - 예약 내역이 없습니다
  - 캠핑장 찾기 버튼

#### 동작

1. 탭 선택 시 필터링
2. API 호출: `GET /v1/reservations?status=upcoming`
3. 카드 클릭 시 상세 페이지로

---

### `/reservations/[id]` - 예약 상세

**상태**: ⏳ 대기 (P0)

#### 구성 요소

- **Header**:
  - 뒤로가기
  - "예약 상세" 제목
- **Status Badge**:
  - 예약 확정 / 이용 완료 / 취소됨
- **QR Code** (체크인용):
  - QR 코드 이미지
  - "이 QR코드를 입구에서 스캔하세요"
- **Campground Info**:
  - 캠핑장 이미지
  - 캠핑장 이름
  - 위치
  - 전화걸기 버튼
- **Reservation Info**:
  - 예약번호
  - 체크인/체크아웃 날짜
  - 사이트 정보
  - 인원
- **Payment Info**:
  - 결제 금액
  - 결제 수단
  - 결제 일시
- **Action Buttons**:
  - 예약 변경 (MVP 제외)
  - 예약 취소 (MVP 제외)
  - 리뷰 작성 (이용 완료 시)
  - 길찾기
  - 영수증 보기

#### 동작

1. API 호출: `GET /v1/reservations/{id}`
2. 액션 버튼 클릭 시 해당 기능 실행

---

### `/reservations/guest` - 비회원 예약 조회

**상태**: ❌ MVP 제외

---

## 💳 결제 페이지

### `/payment/[id]` - 결제 페이지

**상태**: ⏳ 대기 (P0)

#### 구성 요소

- **Header**:
  - 뒤로가기
  - "결제하기" 제목
- **Order Summary**:
  - 캠핑장 이름
  - 날짜
  - 사이트
  - 인원
- **Price Breakdown**:
  - 사이트 요금
  - 추가 옵션 (MVP 제외)
  - 할인 (MVP 제외)
  - **총 결제 금액**
- **Payment Method**:
  - 토스 페이먼츠 위젯
  - 결제 수단 선택 (카드/계좌이체/간편결제)
- **Agreement**:
  - 결제 동의 체크박스
- **Pay Button**:
  - "₩XXX,XXX 결제하기" (sticky)

#### 동작

1. Query param: reservationId
2. 예약 정보 조회: `GET /v1/reservations/{id}`
3. 토스 페이먼츠 SDK 초기화
4. 결제 버튼 클릭
5. 토스 결제창 호출
6. 결제 완료 후 콜백
7. 결제 검증: `POST /v1/payments/{id}/verify`
8. 성공 시: 예약 완료 페이지로

---

## 🗺️ 지도 페이지

### `/map` - 지도 검색

**상태**: ❌ MVP 제외 (P1)

#### 구성 요소

- **Header**:
  - 검색 바
  - 필터 버튼
- **Map**:
  - 네이버 맵
  - 캠핑장 마커
  - 클러스터
- **Bottom Sheet**:
  - 선택한 캠핑장 정보
  - 상세보기 버튼
- **Floating Buttons**:
  - 현재 위치
  - 재검색

---

## 👤 마이페이지

### `/my` - 마이페이지 홈

**상태**: ⏳ 대기 (P0 - 기본만)

#### 구성 요소

- **Header**:
  - "마이페이지" 제목
- **Profile Section**:
  - 프로필 이미지
  - 이름
  - 이메일
  - 프로필 수정 버튼 (MVP 제외)
- **Menu List**:
  - 내 예약
  - 찜한 캠핑장 (MVP 제외)
  - 내 리뷰 (MVP 제외)
  - 결제 내역 (MVP 제외)
  - 고객센터 (MVP 제외)
  - 설정 (MVP 제외)
  - 로그아웃

#### 동작

1. 사용자 정보 표시 (AuthContext에서)
2. 메뉴 클릭 시 해당 페이지로 이동
3. 로그아웃 클릭 시 확인 후 로그아웃

---

## 📱 공통 레이아웃

### Bottom Tab Navigation

**상태**: ⏳ 대기 (P0)

#### 구성 요소

- **4개 탭**:
  1. 홈 (캠핑장 목록)
  2. 지도 (MVP 제외)
  3. 예약
  4. 마이페이지
- **각 탭**:
  - 아이콘
  - 라벨
  - Active 상태 표시

#### 동작

- 탭 클릭 시 해당 페이지로 이동
- 현재 페이지 하이라이트

---

**마지막 업데이트**: 2025-11-09  
**총 페이지 수**: 13개 (MVP 기준 8개)
