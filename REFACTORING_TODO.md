# 프로젝트 리팩토링 TODO 리스트

> **생성일**: 2025-11-06  
> **목표**: React & Next.js 모범 사례 적용  
> **참고**: REACT_NEXTJS_BEST_PRACTICES.md

---

## 🔴 긴급 (Critical) - 성능에 직접 영향

### 1. key={index} 패턴 제거 (14개 발견)
**문제**: 리렌더링 시 컴포넌트가 불필요하게 재생성되어 이미지/리소스 재로드

| 파일 | 라인 | 현재 코드 | 개선 방법 |
|------|------|-----------|-----------|
| `PriceBreakdownSection.tsx` | 74, 124 | `key={index}` | 항목에 고유 ID 사용 |
| `HomeLandingShell.tsx` | 35 | `key={i}` | 스켈레톤은 index 허용 (정적) |
| `ReviewsTab.tsx` | 137, 173 | `key={i}`, `key={index}` | `review.id` 사용 |
| `ReservationCalendar.tsx` | 208 | `key={index}` | 날짜 문자열 사용 |
| `CampgroundCard.tsx` | 201 | `key={index}` | 이미지 URL 사용 |
| `ReviewsSection.tsx` | 111, 213 | `key={index}` | `review.id` 사용 |
| `ReviewModal.tsx` | 278, 350 | `key={index}` | 이미지 URL 사용 |
| `campgrounds/page.tsx` | 227, 241 | `key={index}` | 스켈레톤/`campground.id` |
| `CampgroundsClient.tsx` | 415 | `key={index}` | 필터 값 사용 |

**우선순위**: 
1. ⚠️ 이미지 관련 (CampgroundCard, ReviewModal) - 즉시 수정
2. ⚠️ 리뷰 관련 (ReviewsTab, ReviewsSection) - 즉시 수정
3. ⚡ 기타 (스켈레톤, 필터 등) - 중요도 낮음

---

## 🟡 중요 (High) - 구조 개선

### 2. 중앙 집중식 상태 관리 분산

#### `CampgroundEditClient.tsx`
**현재 문제**:
```tsx
// ❌ 모든 상태가 CampgroundEditClient에 집중
const { formData, ... } = useCampgroundEdit()
const { allImages, ... } = useImageManagement()
const { sites, ... } = useSiteManagement()

// formData 변경 → 전체 리렌더링
```

**개선 방안**:
1. Context 생성: `CampgroundEditContext` (전역 설정만)
2. 상태 격리: 각 섹션이 자신의 상태만 관리
3. memo 적용: 독립적인 섹션 메모이제이션

**작업 순서**:
- [ ] `contexts/CampgroundEditContext.tsx` 생성
- [ ] `BasicInfoSection` 상태 격리
- [ ] `ImageSection` 상태 격리  
- [ ] `SiteSection` 상태 격리
- [ ] `CampgroundEditClient` 단순화

---

### 3. 불필요한 useEffect 제거

**검사 대상**:
- [ ] `useCampgroundEdit.ts` - 의존성 배열 검증
- [ ] `useImageManagement.ts` - 불필요한 effect 확인
- [ ] `useSiteManagement.ts` - API 중복 호출 확인

---

## 🟢 보통 (Medium) - 최적화

### 4. React.memo 적용

**적용 대상 컴포넌트**:
- [ ] `BasicInfoSection` - formData 변경 시에만 리렌더링
- [ ] `ImageSection` - images 변경 시에만 리렌더링
- [ ] `SiteSection` - sites 변경 시에만 리렌더링
- [ ] `CampgroundCard` - campground 변경 시에만 리렌더링
- [ ] `ReviewsSection` - reviews 변경 시에만 리렌더링

---

### 5. useCallback/useMemo 최적화

**검사 기준**:
- 자식에게 전달하는 함수 → useCallback
- 계산 비용이 큰 값 → useMemo
- 단순 계산 → 그대로 유지

**작업**:
- [ ] 모든 event handler에 useCallback 적용 여부 검토
- [ ] 필터링/정렬 로직에 useMemo 적용
- [ ] 불필요한 useMemo 제거

---

## 🔵 낮음 (Low) - 코드 품질

### 6. Props Drilling 제거

**3단계 이상 Props 전달 검사**:
- [ ] 인증 정보 (user, isAuthenticated) → Context 사용
- [ ] 테마 정보 (theme) → Context 사용
- [ ] 캠핑장 ID → URL params 직접 사용

---

### 7. 파일 구조 정리

**현재**:
```
components/
  campground-edit/
    BasicInfoSection.tsx    # Client Component
    ImageSection.tsx        # Client Component
```

**개선**:
```
app/
  campgrounds/
    [id]/
      edit/
        page.tsx                    # Server Component
        CampgroundEditClient.tsx    # Client Component (최소 상태)

components/
  campground-edit/
    BasicInfoSection.tsx      # 독립 상태 관리 + memo
    ImageSection.tsx          # 독립 상태 관리 + memo
    SiteSection.tsx           # 독립 상태 관리 + memo

contexts/
  CampgroundEditContext.tsx   # 전역 설정만

hooks/
  useCampgroundEdit.ts        # Context 소비
```

---

## 📊 작업 진행 순서

### Phase 1: 긴급 수정 (1-2일)
1. ✅ key={imageUrl} 수정 (ImageSection 완료)
2. ⏳ 나머지 13개 key={index} 수정
   - 이미지 관련 우선 (CampgroundCard, ReviewModal)
   - 리뷰 관련 (ReviewsTab, ReviewsSection)

### Phase 2: 구조 개선 (3-5일)
3. ⏳ CampgroundEditContext 생성
4. ⏳ 상태 격리 (BasicInfo → ImageSection → SiteSection)
5. ⏳ memo 적용

### Phase 3: 최적화 (2-3일)
6. ⏳ useCallback/useMemo 최적화
7. ⏳ 불필요한 useEffect 제거

### Phase 4: 정리 (1-2일)
8. ⏳ Props Drilling 제거
9. ⏳ 파일 구조 정리
10. ⏳ 문서 업데이트

---

## 🎯 성공 기준

**리팩토링 후 검증**:
- [ ] input 타이핑 시 이미지 섹션 리렌더링 없음
- [ ] 탭 전환 시 불필요한 API 호출 없음
- [ ] React DevTools Profiler에서 리렌더링 횟수 50% 이상 감소
- [ ] Lighthouse Performance 점수 90+ 유지
- [ ] 모든 기능 정상 작동 (E2E 테스트)

---

## 📝 참고사항

- 각 작업마다 **커밋 + 테스트** 필수
- Breaking changes 발생 시 즉시 롤백
- 성능 측정: Before/After 비교
- 문서 업데이트: 변경사항 기록

---

## 🔗 관련 문서

- [REACT_NEXTJS_BEST_PRACTICES.md](./REACT_NEXTJS_BEST_PRACTICES.md)
- [ARCHITECTURE.md](./frontend/ARCHITECTURE.md)
