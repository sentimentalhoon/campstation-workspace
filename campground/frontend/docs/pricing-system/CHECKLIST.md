# 요금제 시스템 구현 체크리스트

## 📝 진행 상황 추적

### ✅ Phase 1: 기반 작업 (완료)

- [x] `lib/types/pricing.ts` 타입 정의
  - [x] PricingRuleType enum
  - [x] SeasonType enum
  - [x] CreateSitePricingRequest interface
  - [x] SitePricingResponse interface
  - [x] PriceBreakdown interface
  - [x] DailyPriceDetail interface
  - [x] AppliedDiscount interface

- [x] `lib/api/pricing.ts` API 함수 구현
  - [x] `createSitePricing(siteId, data)` - POST 요금제 생성
  - [x] `getSitePricings(siteId)` - GET 사이트별 요금제 목록
  - [x] `updateSitePricing(siteId, pricingId, data)` - PUT 요금제 수정
  - [x] `deleteSitePricing(siteId, pricingId)` - DELETE 요금제 삭제
  - [x] `getAllOwnerPricings()` - GET Owner의 모든 요금제
  - [x] `calculatePrice(siteId, checkInDate, checkOutDate, numberOfGuests)` - GET 요금 계산

- [x] `hooks/owner/useSitePricing.ts` Hook 구현
  - [x] useState로 pricings 상태 관리
  - [x] useEffect로 초기 데이터 로드
  - [x] createPricing 함수
  - [x] updatePricing 함수
  - [x] deletePricing 함수
  - [x] toggleActive 함수 (활성화/비활성화)
  - [x] refetch 함수

- [x] 사이트 목록 페이지 수정 (`app/dashboard/owner/campgrounds/[id]/sites/page.tsx`)
  - [x] 탭 UI 추가 ("구역 목록" | "요금제 관리")
  - [x] 탭 상태 관리 (useState)
  - [x] 탭별 컨텐츠 조건부 렌더링

---

### ✅ Phase 2: 요금제 목록 (완료)

- [x] 요금제 목록 페이지 생성 (`app/dashboard/owner/campgrounds/[id]/sites/pricing/page.tsx`)
  - [x] 페이지 레이아웃
  - [x] useSitePricing Hook 연동
  - [x] 로딩 상태 처리
  - [x] 에러 상태 처리
  - [x] 빈 상태 (요금제 없을 때) UI

- [x] `PricingCard.tsx` 컴포넌트
  - [x] Props 타입 정의 (SitePricingResponse)
  - [x] 카드 레이아웃
  - [x] 요금제 이름 + 우선순위 표시
  - [x] 규칙 타입 + 시즌 타입 배지
  - [x] 기간 표시 (시작월/일 ~ 종료월/일)
  - [x] 기본 요금 + 주말 요금 표시
  - [x] 인원 정책 표시
  - [x] 할인 정책 목록 표시
  - [x] 활성화 상태 토글 버튼
  - [x] 수정 버튼
  - [x] 삭제 버튼
  - [x] 삭제 확인 모달

- [x] 요금제 정렬
  - [x] 우선순위 내림차순 정렬
  - [x] 활성화 요금제 우선 표시

---

### ✅ Phase 3: 요금제 생성/수정 (완료)

- [x] `PricingForm.tsx` 컴포넌트
  - [x] Props 타입 (mode: 'create' | 'edit', initialData?, onSave, onCancel)
  - [x] 모달 레이아웃
  - [x] 폼 상태 관리 (useState)

  #### 기본 정보 섹션
  - [x] 요금제 이름 입력
  - [x] 설명 textarea
  - [x] 규칙 타입 선택 (select)

  #### 요금 설정 섹션
  - [x] 평일 기본 요금 입력 (숫자)
  - [x] 주말 요금 입력 (선택)
  - [x] 요일별 배율 설정 체크박스
  - [x] 요일별 배율 입력 (7개 input)
  - [x] JSON 변환 로직 (dayMultipliers)

  #### 인원 정책 섹션
  - [x] 기준 인원 입력
  - [x] 최대 인원 입력
  - [x] 추가 인원당 요금 입력

  #### 시즌/기간 설정 섹션
  - [x] 시즌 타입 선택 (select)
  - [x] 시작 월/일 입력
  - [x] 종료 월/일 입력
  - [x] ruleType에 따른 조건부 표시

  #### 할인 정책 섹션
  - [x] 장기 숙박 할인 체크박스
  - [x] 장기 숙박 최소 박수 + 할인율 입력
  - [x] 연박 할인 체크박스
  - [x] 연박 최소 박수 + 할인율 입력
  - [x] 조기 예약 할인 체크박스
  - [x] 조기 예약 최소 일수 + 할인율 입력

  #### 기타 설정
  - [x] 우선순위 입력
  - [x] 활성화 체크박스

  #### 폼 처리
  - [x] 폼 유효성 검사
  - [x] 제출 버튼 (생성/수정)
  - [x] 취소 버튼
  - [x] API 호출 (생성 또는 수정)
  - [x] 성공/실패 처리
  - [x] 로딩 상태

- [x] 폼 모달 통합
  - [x] 요금제 목록에서 "추가" 버튼 → 모달 열기
  - [x] 요금제 카드에서 "수정" 버튼 → 모달 열기 (데이터 전달)
  - [x] 모달 닫기 로직

---

### ✅ Phase 4: 요금 계산기 (완료)

- [x] `PriceCalculator.tsx` 컴포넌트
  - [x] Props 타입 (siteId)
  - [x] 레이아웃

  #### 입력 영역
  - [x] 체크인 날짜 선택 (date input)
  - [x] 체크아웃 날짜 선택 (date input)
  - [x] 인원 수 선택 (number input)
  - [x] 계산 버튼

  #### 결과 표시
  - [x] 날짜별 요금 상세 (DailyPriceDetail[])
    - [x] 날짜
    - [x] 기본 요금
    - [x] 적용 요금
    - [x] 적용된 요금제 이름
  - [x] 소계 (subtotal)
  - [x] 추가 인원 요금 (extraGuestFee)
  - [x] 할인 내역 (AppliedDiscount[])
    - [x] 할인 타입
    - [x] 할인명
    - [x] 할인 금액
    - [x] 할인율
  - [x] 총 할인 금액 (totalDiscount)
  - [x] 최종 결제 금액 (finalPrice)

  #### 기능
  - [x] calculatePrice API 호출
  - [x] 로딩 상태
  - [x] 에러 처리
  - [x] 날짜 유효성 검사 (체크아웃 > 체크인)

- [x] 계산기 통합
  - [x] 별도 탭으로 분리 ("요금제 목록" | "요금 계산기")

---

### ✅ Phase 5: 테스트 및 개선 (완료)

#### 기능 테스트

- [x] 요금제 생성 테스트
  - [x] 기본 요금제 생성
  - [x] 시즌별 요금제 생성
  - [x] 기간 지정 요금제 생성
  - [x] 특별 이벤트 요금제 생성

- [x] 요금제 수정 테스트
  - [x] 기본 정보 수정
  - [x] 요금 변경
  - [x] 할인 정책 추가/제거
  - [x] 우선순위 변경

- [x] 요금제 삭제 테스트
  - [x] 삭제 확인 모달
  - [x] 삭제 후 목록 새로고침

- [x] 활성화/비활성화 테스트
  - [x] 토글 동작
  - [x] 상태 변경 반영

- [x] 요금 계산 테스트
  - [x] 다양한 날짜 조합
  - [x] 다양한 인원 수
  - [x] 할인 적용 확인
  - [x] 우선순위에 따른 요금 적용 확인

#### UX 개선

- [x] 로딩 스피너 추가
- [x] 에러 메시지 개선
- [x] 성공 토스트 알림
- [x] 폼 입력 가이드 툴팁
- [x] 반응형 디자인 점검
- [x] 접근성 개선 (a11y)

#### 에러 처리

- [x] API 에러 처리
- [x] 네트워크 에러 처리
- [x] 권한 에러 처리 (403)
- [x] 폼 유효성 에러 표시

#### 성능 최적화

- [x] 불필요한 리렌더링 방지 (useMemo, useCallback)
- [x] 목록 페이지네이션 고려
- [x] 이미지 최적화
- [x] 코드 스플리팅

---

## ✅ 구현 완료

### 구현된 파일 목록

1. **타입 정의** (`lib/types/pricing.ts`) - 187줄
   - 9개 타입/인터페이스 정의
   - PricingRuleType, SeasonType, CreateSitePricingRequest 등

2. **API 함수** (`lib/api/pricing.ts`) - 175줄
   - 6개 API 함수 (create, getBySite, update, delete, getAllOwner, calculate)

3. **Hook** (`hooks/owner/useSitePricing.ts`) - 237줄
   - useSitePricing Hook
   - 상태 관리 및 CRUD 함수

4. **요금제 목록 페이지** (`app/.../pricing/page.tsx`) - 371줄
   - 사이트 선택 드롭다운
   - 탭 네비게이션 (요금제 목록 | 요금 계산기)
   - Toast 알림 통합
   - 로딩/에러/빈 상태 처리

5. **요금제 카드** (`components/PricingCard.tsx`) - 239줄
   - 요금제 정보 표시
   - 수정/삭제/토글 기능

6. **요금제 폼** (`components/PricingForm.tsx`) - 816줄
   - 8개 섹션 (기본 정보, 요금, 인원, 시즌/기간, 할인, 기타)
   - 생성/수정 모드 지원
   - 로딩 상태 및 유효성 검사

7. **요금 계산기** (`components/PriceCalculator.tsx`) - 305줄
   - 날짜/인원 입력
   - 날짜별 요금 상세 테이블
   - 요금 요약 및 할인 내역
   - 에러 처리

### 총 구현 라인: 약 2,330줄

### 주요 기능

✅ **요금제 관리**

- 생성/수정/삭제
- 활성화/비활성화 토글
- 우선순위 기반 정렬
- 4가지 규칙 타입 지원 (BASE, SEASONAL, DATE_RANGE, SPECIAL_EVENT)

✅ **요금 설정**

- 평일/주말 요금
- 요일별 배율 (JSON)
- 인원 정책 (기준/최대/추가 요금)
- 시즌/기간 설정

✅ **할인 정책**

- 장기 숙박 할인
- 연박 할인
- 조기 예약 할인

✅ **요금 계산**

- 날짜별 요금 상세
- 할인 적용 계산
- 최종 결제 금액 표시

✅ **UX 개선**

- Toast 알림
- 로딩 스피너
- 에러 메시지 개선
- 반응형 디자인

---

## 🚀 다음 단계

### 개선 아이디어

- [ ] 요금제 템플릿 기능 (자주 사용하는 요금제 저장)
- [ ] 요금제 복사 기능
- [ ] 요금제 미리보기 (캘린더 뷰)
- [ ] 요금제 적용 현황 그래프
- [ ] 일괄 편집 기능 (여러 요금제 동시 수정)
- [ ] 요금제 히스토리 (변경 이력 추적)
- [ ] Excel 내보내기/가져오기

---

## 📌 메모

### 주의사항

- 요금제 우선순위는 숫자가 **높을수록** 우선
- `dayMultipliers`는 JSON 문자열로 변환 필요
- `ruleType`에 따라 시즌/기간 입력 필드 조건부 표시
- 할인은 여러 개 동시 적용 가능
- Toast 알림은 3초 후 자동 닫힘

### 백엔드 API 엔드포인트

```
POST   /v1/owner/sites/{siteId}/pricing          - 요금제 생성
GET    /v1/owner/sites/{siteId}/pricing          - 사이트별 요금제 목록
PUT    /v1/owner/sites/{siteId}/pricing/{id}     - 요금제 수정
DELETE /v1/owner/sites/{siteId}/pricing/{id}     - 요금제 삭제
GET    /v1/owner/pricing                         - Owner의 모든 요금제
GET    /v1/pricing/calculate                     - 요금 계산
```
