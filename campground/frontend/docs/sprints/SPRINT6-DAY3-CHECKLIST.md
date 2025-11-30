# Sprint 6 - Day 3 체크리스트

**날짜**: 2025-11-13  
**목표**: 백엔드 API 연동 테스트 및 OAuth2 통합 테스트

---

## ✅ 사전 확인 사항

### 1. 환경 설정

- [x] `.env.local` 파일 존재 확인
- [x] OAuth Client ID 설정 확인 (카카오/네이버)
- [x] API Base URL 설정 (`http://localhost:8080/api`)

### 2. 서버 상태

- [x] 백엔드 서버 실행 중 (포트 8080)
- [x] 프론트엔드 서버 실행 중 (포트 3001)

---

## 📋 테스트 체크리스트

### Phase 1: API 연결 테스트

#### 1.1 Health Check

- [ ] GET `http://localhost:8080/actuator/health` 응답 확인
- [ ] 응답 상태: 200 OK
- [ ] 응답 데이터: `{"status": "UP"}`

#### 1.2 ADMIN 통계 API

- [ ] GET `/v1/admin/stats` 응답 확인
- [ ] 필수 필드 검증:
  - [ ] `users.total`
  - [ ] `campgrounds.total`
  - [ ] `reservations.total`
  - [ ] `revenue.total`
  - [ ] `reports.total`

#### 1.3 최근 활동 API

- [ ] GET `/v1/admin/activities?limit=10` 응답 확인
- [ ] 배열 형태 응답 확인
- [ ] Activity 타입 검증

---

### Phase 2: ADMIN 대시보드 UI 테스트

#### 2.1 페이지 접근

- [ ] `/dashboard/admin` 페이지 접속
- [ ] 로딩 상태 표시 확인
- [ ] 권한 검증 (ADMIN 역할 필요)

#### 2.2 통계 카드 렌더링

- [ ] 전체 사용자 수 표시
- [ ] 이번달 신규 사용자 표시
- [ ] 전체 캠핑장 수 표시
- [ ] 승인 대기 캠핑장 표시
- [ ] 전체 예약 수 표시
- [ ] 이번달 예약 수 표시
- [ ] 총 수익 표시
- [ ] 이번달 수익 표시

#### 2.3 차트 렌더링

- [ ] 사용자 증가 추세 차트 (TrendChart)
- [ ] 매출 추세 차트 (TrendChart)
- [ ] 역할별 분포 차트 (DistributionChart)
- [ ] 예약 상태 분포 차트 (DistributionChart)
- [ ] 캠핑장 승인 상태 차트 (ComparisonChart)

#### 2.4 최근 활동

- [ ] 최근 활동 리스트 표시
- [ ] 활동 타입별 아이콘 표시
- [ ] 타임스탬프 표시

---

### Phase 3: OAuth2 통합 테스트

#### 3.1 카카오 로그인

- [ ] `/login` 페이지 접속
- [ ] 카카오 로그인 버튼 클릭
- [ ] 카카오 인증 페이지로 리다이렉트
- [ ] 인증 후 콜백 URL로 리다이렉트
- [ ] Authorization Code 파싱
- [ ] 백엔드 API 호출 (`POST /v1/auth/kakao`)
- [ ] Access Token 저장 (localStorage)
- [ ] Refresh Token 저장 (localStorage)
- [ ] 사용자 정보 저장 (AuthContext)
- [ ] 홈페이지로 리다이렉트

#### 3.2 네이버 로그인

- [ ] `/login` 페이지 접속
- [ ] 네이버 로그인 버튼 클릭
- [ ] 네이버 인증 페이지로 리다이렉트
- [ ] 인증 후 콜백 URL로 리다이렉트
- [ ] Authorization Code 파싱
- [ ] 백엔드 API 호출 (`POST /v1/auth/naver`)
- [ ] Access Token 저장
- [ ] Refresh Token 저장
- [ ] 사용자 정보 저장
- [ ] 홈페이지로 리다이렉트

#### 3.3 토큰 관리

- [ ] Access Token 자동 추가 (API 요청 시)
- [ ] 토큰 만료 감지 (5분 전)
- [ ] 자동 토큰 갱신 (Refresh Token 사용)
- [ ] 갱신 실패 시 로그인 페이지 리다이렉트

---

### Phase 4: 에러 처리 테스트

#### 4.1 네트워크 에러

- [ ] 백엔드 서버 중지 후 API 호출
- [ ] 네트워크 에러 메시지 표시
- [ ] 재시도 버튼 작동 확인

#### 4.2 401 Unauthorized

- [ ] 만료된 토큰으로 API 호출
- [ ] 자동 토큰 갱신 시도
- [ ] 갱신 실패 시 `/error/401` 페이지 표시

#### 4.3 403 Forbidden

- [ ] MEMBER 역할로 ADMIN 페이지 접근
- [ ] `/error/403` 페이지 표시
- [ ] "홈으로" 버튼 작동 확인

#### 4.4 500 Server Error

- [ ] 서버 에러 발생 시 `/error/500` 페이지 표시
- [ ] "새로고침" 버튼 작동 확인

---

## 📊 테스트 결과 기록

### API 응답 시간

- Health Check: \_\_\_ ms
- ADMIN Stats: \_\_\_ ms
- Recent Activities: \_\_\_ ms

### OAuth2 플로우

- 카카오 로그인: [ ] 성공 / [ ] 실패
- 네이버 로그인: [ ] 성공 / [ ] 실패

### 발견된 이슈

1.
2.
3.

---

## 🔧 다음 단계

- [ ] 이슈 수정
- [ ] 추가 테스트 케이스 작성
- [ ] 성능 최적화
- [ ] 문서 업데이트
