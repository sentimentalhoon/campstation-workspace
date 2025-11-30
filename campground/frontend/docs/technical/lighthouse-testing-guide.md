# Lighthouse 테스팅 가이드

## 📋 개요

Lighthouse는 웹 페이지의 품질을 측정하는 도구로, 성능, 접근성, 모범 사례, SEO를 평가합니다.

**목표**: 모든 주요 페이지에서 90점 이상 달성

---

## 🚀 테스트 준비

### 1. 프로덕션 빌드 생성

```bash
cd frontend
npm run build
npm run start
```

서버가 http://localhost:3000 에서 실행됩니다.

### 2. Chrome DevTools에서 Lighthouse 실행

1. Chrome 브라우저에서 테스트할 페이지 열기
2. F12 (개발자 도구) 열기
3. "Lighthouse" 탭 선택
4. 설정:
   - Mode: **Navigation (Default)**
   - Device: **Desktop** (모바일도 테스트 권장)
   - Categories: **모두 선택** ✅
     - Performance
     - Accessibility
     - Best Practices
     - SEO
5. "Analyze page load" 클릭

---

## 📊 테스트 대상 페이지

### Priority 1: 핵심 페이지

| 페이지      | URL                                    | 목표 점수 | 상태 |
| ----------- | -------------------------------------- | --------- | ---- |
| 홈          | http://localhost:3000                  | 90+       | ⏳   |
| 캠핑장 목록 | http://localhost:3000/campgrounds      | 90+       | ⏳   |
| 캠핑장 상세 | http://localhost:3000/campgrounds/[id] | 90+       | ⏳   |
| 로그인      | http://localhost:3000/login            | 90+       | ⏳   |

### Priority 2: 사용자 페이지

| 페이지     | URL                                            | 목표 점수 | 상태 |
| ---------- | ---------------------------------------------- | --------- | ---- |
| 마이페이지 | http://localhost:3000/dashboard/user           | 90+       | ⏳   |
| 예약 목록  | http://localhost:3000/reservations             | 90+       | ⏳   |
| 찜 목록    | http://localhost:3000/dashboard/user/favorites | 90+       | ⏳   |
| 내 리뷰    | http://localhost:3000/dashboard/user/reviews   | 90+       | ⏳   |

---

## 🎯 점수 기준

### 각 카테고리별 목표

- **Performance**: 90+ 🟢
  - First Contentful Paint (FCP): < 1.8s
  - Largest Contentful Paint (LCP): < 2.5s
  - Total Blocking Time (TBT): < 200ms
  - Cumulative Layout Shift (CLS): < 0.1
  - Speed Index: < 3.4s

- **Accessibility**: 90+ 🟢
  - ARIA 속성 올바른 사용
  - 대비율 적절
  - 포커스 가능한 요소에 접근성 이름
  - 이미지 alt 텍스트

- **Best Practices**: 90+ 🟢
  - HTTPS 사용
  - 콘솔 에러 없음
  - 이미지 최적화
  - 보안 헤더

- **SEO**: 90+ 🟢
  - meta 태그 존재
  - viewport 설정
  - 크롤링 가능한 링크
  - 유효한 robots.txt

---

## 🔍 주요 체크 포인트

### 이미 적용된 최적화

✅ **성능 최적화**

- Next.js Image 컴포넌트 사용 (자동 최적화)
- Dynamic import로 코드 분할
- React Query 캐싱 전략

✅ **접근성 개선**

- ARIA 속성 추가 (role, aria-label, aria-live)
- LoadingSpinner, ErrorMessage 접근성
- QueryStateHandler로 일관된 상태 처리

✅ **SEO 기본 설정**

- Next.js metadata API 사용
- Semantic HTML 구조

### 개선이 필요할 수 있는 항목

⚠️ **Performance**

- LCP가 느린 경우: 이미지 최적화, 폰트 최적화
- TBT가 높은 경우: JavaScript 번들 크기 감소
- CLS 발생: 이미지/광고 레이아웃 시프트 방지

⚠️ **Accessibility**

- 색상 대비율 미달: 텍스트 색상 조정
- 탭 순서 문제: tabindex 검토
- 스크린 리더 누락: aria-label 추가

⚠️ **Best Practices**

- 이미지 해상도: 적절한 크기 사용
- 타사 스크립트: 성능 영향 최소화

⚠️ **SEO**

- meta description 추가
- Open Graph 태그
- Canonical URL

---

## 📝 결과 기록 템플릿

각 페이지 테스트 후 아래 형식으로 기록:

```markdown
### [페이지명] - YYYY-MM-DD

**URL**: http://localhost:3000/...

**점수**:

- Performance: XX / 100
- Accessibility: XX / 100
- Best Practices: XX / 100
- SEO: XX / 100

**주요 이슈**:

1. [이슈 설명]
2. [이슈 설명]

**개선 계획**:

- [ ] [개선 항목]
- [ ] [개선 항목]
```

---

## 🛠️ 문제 해결 가이드

### Performance 점수가 낮을 때

1. **이미지 최적화**

   ```tsx
   // ❌ Bad
   <img src="/image.jpg" />

   // ✅ Good
   <Image
     src="/image.jpg"
     width={800}
     height={600}
     sizes="(max-width: 768px) 100vw, 800px"
     priority // Above the fold
   />
   ```

2. **폰트 최적화**

   ```tsx
   // next.config.ts
   experimental: {
     optimizeFonts: true;
   }
   ```

3. **코드 분할**
   ```tsx
   const HeavyComponent = dynamic(() => import("./Heavy"), {
     loading: () => <LoadingSpinner />,
   });
   ```

### Accessibility 점수가 낮을 때

1. **색상 대비율 개선**
   - WCAG AA: 최소 4.5:1 (일반 텍스트)
   - WCAG AAA: 최소 7:1 (권장)

2. **ARIA 속성 추가**

   ```tsx
   <button aria-label="닫기">×</button>
   <img src="..." alt="캠핑장 전경" />
   <nav aria-label="주요 네비게이션">
   ```

3. **키보드 접근성**
   - 모든 인터랙티브 요소 tab으로 접근 가능
   - focus 스타일 명확하게

### SEO 점수가 낮을 때

1. **메타 태그 추가**

   ```tsx
   // app/layout.tsx
   export const metadata = {
     title: "캠프스테이션",
     description: "전국 캠핑장 예약 플랫폼",
     openGraph: {
       title: "캠프스테이션",
       description: "...",
       images: ["/og-image.jpg"],
     },
   };
   ```

2. **구조화된 데이터**
   ```json
   {
     "@context": "https://schema.org",
     "@type": "LocalBusiness",
     "name": "캠프스테이션"
   }
   ```

---

## 📚 참고 자료

- [Lighthouse 공식 문서](https://developer.chrome.com/docs/lighthouse/)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [WCAG 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)

---

## ✅ 완료 체크리스트

- [ ] 프로덕션 빌드 생성
- [ ] 8개 주요 페이지 Lighthouse 테스트
- [ ] 90점 미만 페이지 이슈 분석
- [ ] 개선 계획 수립
- [ ] 개선 사항 적용
- [ ] 재테스트 및 점수 확인
- [ ] 결과 문서화
