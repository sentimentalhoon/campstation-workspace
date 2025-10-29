# Changelog

## [2025-10-29] AWS 클라우드 배포 준비 및 인프라 구축

### 🎯 작업 목표

- 하드코딩된 localhost 참조 제거 및 환경별 동적 URL 설정
- 외부 네트워크 접근을 위한 호스트 IP 설정
- AWS S3 비용 분석 및 프리 티어 활용 전략 수립
- GitHub Actions를 활용한 CI/CD 파이프라인 구축
- Terraform을 사용한 완전한 AWS 인프라 as Code 구현
- 프로덕션 환경 설정 및 배포 문서화

### ✨ 주요 변경사항

#### 1. 하드코딩된 localhost 제거 및 환경별 URL 설정

**프론트엔드 API 설정 개선**
- `src/lib/api/config.ts` 수정
  - `DEFAULT_API_BASE`를 환경별로 동적 설정
  - localhost는 로컬 개발용, 호스트 IP는 dev/docker 환경용
- `next.config.ts` 수정
  - 이미지 도메인에 호스트 IP 추가
  - CSP(Content Security Policy) 설정에 호스트 IP 포함

**백엔드 설정 개선**
- `S3FileService.java` 수정
  - 하드코딩된 localhost를 `externalEndpoint` 변수로 변경
- `OAuth2AuthenticationSuccessHandler.java` 수정
  - 리다이렉트 URL을 `FRONTEND_URL` 환경 변수로 동적 설정
- `WebConfig.java` 수정
  - CORS 허용 오리진을 환경 변수로 설정
- `OpenApiConfig.java` 수정
  - 서버 URL을 `SERVER_URL` 환경 변수로 동적 설정

**환경 설정 파일 추가**
- `.env.dev`: 개발 환경용 URL 설정
- `.env.docker`: Docker 환경용 URL 설정
- `docker-compose.dev.yml`: API URL을 호스트 IP로 변경

#### 2. 외부 네트워크 접근 설정

**호스트 IP 기반 접근**
- 개발/도커 환경에서 `192.168.31.107` 호스트 IP 사용
- 로컬 개발은 여전히 localhost 유지
- 포트 포워딩을 통한 외부 접근 가능

#### 3. AWS 비용 분석 및 최적화

**S3 프리 티어 활용**
- 5GB 표준 스토리지 무료
- 월 20,000건 GET 요청 무료
- 월 100GB 데이터 전송 무료
- Glacier로 장기 보관 시 추가 비용 절감

**전체 AWS 비용 예측**
- ECS Fargate: 프리 티어 2개월 후 월 $10-20
- RDS PostgreSQL: 프리 티어 750시간 후 월 $15
- ElastiCache Redis: 프리 티어 750시간 후 월 $10
- ALB: 월 $20
- CloudFront: 1TB 전송 무료 후 월 $1-3
- S3: 5GB 무료 후 월 $1-5
- **총 예상 비용: 프리 티어 기간 후 월 $60-80**

#### 4. GitHub Actions CI/CD 파이프라인 구축

**자동화된 배포 워크플로우**
- `.github/workflows/deploy.yml` 생성
- main/master 브랜치 푸시 시 자동 배포 트리거
- Docker 이미지 빌드 및 ECR 푸시 자동화
- ECS 작업 정의 업데이트 및 롤링 배포

**워크플로우 기능**
- AWS 자격 증명으로 ECR 로그인
- 프론트엔드/백엔드 이미지 병렬 빌드
- ECS 서비스 강제 새 배포
- 배포 완료 대기 및 상태 확인

#### 5. Terraform을 사용한 AWS 인프라 구축

**완전한 인프라 as Code**
- `infrastructure/` 디렉토리 생성
- VPC, 서브넷, 보안 그룹 자동 구성
- RDS PostgreSQL, ElastiCache Redis 생성
- ECS 클러스터 및 Fargate 서비스 설정
- ALB(Application Load Balancer) 구성
- S3 버킷 및 CloudFront CDN 설정

**주요 Terraform 파일들**
- `main.tf`: VPC 및 기본 리소스
- `database.tf`: RDS 및 Redis
- `ecs.tf`: ECS 클러스터 및 ECR
- `services.tf`: 작업 정의 및 서비스
- `loadbalancer.tf`: ALB 및 대상 그룹
- `s3.tf`: S3 버킷 및 CloudFront

#### 6. 프로덕션 환경 설정

**환경 변수 체계**
- `.env.prod` 파일 생성
- AWS 리소스 엔드포인트 설정
- 데이터베이스, Redis, S3 연결 정보
- JWT 및 OAuth 시크릿 키 설정

**보안 고려사항**
- 민감 정보 환경 변수화
- IAM 최소 권한 원칙 적용
- VPC 보안 그룹으로 네트워크 격리

#### 7. 배포 문서화 및 가이드

**포괄적인 배포 가이드**
- `aws-deployment-plan.md` 완전 업데이트
- ECS Fargate 기반 아키텍처 다이어그램
- 단계별 배포 절차 설명
- 비용 최적화 및 모니터링 가이드

**인프라 설정 가이드**
- `infrastructure/README.md` 생성
- Terraform 명령어 및 변수 설명
- 문제 해결 및 모니터링 방법

### 🔧 기술적 개선사항

#### 환경별 설정 관리
- 개발/도커/프로덕션 환경 완전 분리
- 환경 변수 기반 동적 구성
- 하드코딩 제거로 유연성 향상

#### CI/CD 자동화
- GitHub Actions로 완전 자동화
- Docker 빌드 및 배포 자동화
- 롤링 업데이트로 무중단 배포

#### 인프라 자동화
- Terraform으로 인프라 코드화
- 재현 가능한 환경 구축
- 비용 효율적인 리소스 구성

#### 모니터링 및 로깅
- CloudWatch 로그 그룹 설정
- ALB 헬스 체크 구성
- ECS 서비스 모니터링

### 📊 영향 및 이점

#### 개발 효율성 향상
- 환경별 설정 자동화로 개발 속도 향상
- 외부 접근으로 모바일 테스트 용이
- CI/CD로 배포 자동화

#### 비용 최적화
- AWS 프리 티어 최대 활용
- Fargate Spot 및 예약 인스턴스 고려
- CloudFront로 전송 비용 절감

#### 운영 안정성
- 인프라 as Code로 재현성 확보
- 자동화된 배포로 휴먼 에러 감소
- 모니터링 체계 구축

### 🎯 다음 단계

1. **AWS 계정 및 권한 설정**
2. **GitHub 리포지토리 생성 및 Secrets 구성**
3. **Terraform 인프라 배포** (`terraform apply`)
4. **환경 변수 실제 값으로 업데이트**
5. **첫 번째 자동 배포 실행**

---

## [2025-10-28] Admin 대시보드 개선 및 무통장 입금 기능 추가

### 🎯 작업 목표

- Admin 캠핑장 목록에 추가 정보 표시 토글 기능
- Admin 캠핑장 목록 검색 기능
- 무한 스크롤 페이징 구현
- 무통장 입금 시 입금자명 저장 기능
- Caffeine 캐시 모니터링 API

### ✨ 주요 변경사항

#### 1. 캠핑장 목록 개선 (CampgroundList)

**프론트엔드**

- 추가 정보 표시 토글 기능
  - 연락처: 전화번호, 이메일, 웹사이트
  - 통계: 리뷰 수, 찜 수
  - 오너 정보: 이름, 이메일, 연락처
- Admin 전용 검색 기능
  - 캠핑장 이름 및 주소로 실시간 검색
  - 검색 결과 카운트 표시
- 무한 스크롤 페이징
  - Intersection Observer 사용
  - 페이지당 20개 항목
  - 자동 추가 로딩

**백엔드**

- `CampgroundAdminFacade.toResponse()` 수정
  - imageUrl presigned URL 변환 추가
  - 모든 이미지 필드에 presigned URL 적용

#### 2. 무통장 입금 입금자명 저장

**데이터베이스**

- 마이그레이션 `V12__add_depositor_name_to_payments.sql`
  - `payments.depositor_name` 컬럼 추가 (VARCHAR(100))
  - PostgreSQL 표준 문법 사용

**백엔드**

- `Payment` 엔티티 수정
  - `depositorName` 필드 추가
  - Getter/Setter 및 Builder 패턴 업데이트
- `ReservationService` 수정
  - 예약 생성 시 입금자명 저장
- `PaymentResponse` DTO 업데이트
  - `depositorName` 필드 추가

**프론트엔드**

- `ReservationDetailModal` 수정
  - BANK_TRANSFER 결제 시 입금자명 표시
- 타입 정의 업데이트
  - `PaymentResponse`, `PaymentInfo`에 `depositorName` 추가

#### 3. 캐시 모니터링 API

**백엔드**

- `CacheMonitoringController` 신규 생성
  - `GET /api/admin/cache/stats` - 모든 캐시 통계
  - `GET /api/admin/cache/stats/{cacheName}` - 특정 캐시 통계
  - `GET /api/admin/cache/list` - 캐시 목록
  - `DELETE /api/admin/cache/clear` - 모든 캐시 초기화
  - `DELETE /api/admin/cache/clear/{cacheName}` - 특정 캐시 초기화
  - `DELETE /api/admin/cache/{cacheName}/{key}` - 캐시 키 삭제
- Caffeine 캐시 통계 제공
  - Hit/Miss 비율
  - Eviction 횟수
  - 캐시 크기
  - 로드 시간 등

### 📊 캐시 현황

**Redis 캐시 (L2)**

- `campgrounds`: 4시간 TTL
- `popularCampgrounds`: 6시간 TTL
- `users`: 4시간 TTL
- 기타 리뷰, 찜하기 관련 캐시

**Caffeine 캐시 (L1)**

- `presignedUrls`: 6일 TTL
- `averageRatings`: 10분 TTL
- `reviewCounts`: 10분 TTL
- `dashboardStats`: 1분 TTL
- `ownerDashboardStats`: 1분 TTL
- `reviewStats`: 5분 TTL

**주의사항**

- Admin API (`CampgroundAdminFacade.findAll`)는 캐시 미적용
- 일반 사용자 API는 Redis 캐시 적용

### 🐛 버그 수정

- 무한 스크롤 초기 로드 문제 해결
  - `filteredCampgrounds` 동기화 이슈 수정
  - append 시 `filteredCampgrounds`도 함께 업데이트

### 📝 타입 개선

**프론트엔드**

- `UserResponse` 타입 확장
  - `phone`, `role`, `status`, `createdAt`, `updatedAt` 추가
- `PaymentResponse` 타입 확장
  - `depositorName` 추가

## [2025-10-28] 환불 기능 및 예약 타이머 시스템 개선

### 🎯 작업 목표

- 사용자용 환불 신청 기능 구현
- 재결제 기능 추가
- 예약 타이머 시스템 최적화 (5분 → 1분)
- 오너/운영자용 환불 처리 기능 구현 (제한 없음)
- 결제 대기 타이머 UI 추가

### ✨ 주요 변경사항

#### 1. 사용자용 환불 기능

**백엔드 (Spring Boot)**

- `PaymentService.processRefund()` 메서드 추가
  - 환불 정책 적용: 당일 환불 불가, 전액 환불 불가
  - 체크인 7일 전: 70% 환불
  - 체크인 3일 전: 50% 환불
  - 체크인 1일 전: 30% 환불
  - Toss Payments API 연동
  - 환불 완료 시 예약 자동 취소 (ReservationStatus.CANCELLED)

**프론트엔드 (Next.js)**

- `UserReservationDetailModal.tsx` 생성

  - 예약 상세 정보 표시
  - 환불 정책 안내
  - 환불 신청 버튼
  - 환불 가능 금액 자동 계산

- 컴포넌트 통합:
  - `ReservationsTab.tsx`: 상세보기/환불 신청 버튼 추가
  - `DashboardClient.tsx`: 모달 통합
  - `ReservationsClient.tsx`: 환불 신청 기능 추가

#### 2. 재결제 기능

**프론트엔드 (Next.js)**

- `/reservations/[id]/payment` 라우트 생성

  - 결제 실패/대기 상태에서 재결제 가능
  - Header/Footer 포함
  - 뒤로 가기 버튼 추가
  - `router.push()` 사용 (Next.js 권장 방식)

- 재결제 버튼 추가:
  - `ReservationsTab.tsx`
  - `ReservationsClient.tsx`
  - 결제 상태가 FAILED 또는 PENDING일 때 표시

#### 3. 예약 타이머 시스템 최적화

**백엔드 (Spring Boot)**

- `ReservationCancellationScheduler.java` 수정
  - 체크 간격: 5분 → 1분 (`@Scheduled(cron = "0 */1 * * * *")`)
  - 30분 미결제 예약 자동 취소
  - 예약 취소 시 결제도 CANCELLED 상태로 변경
  - PaymentRepository 의존성 추가

**프론트엔드 (Next.js)**

- `PaymentTimer.tsx` 컴포넌트 생성

  - 30분 결제 제한 시간 실시간 카운트다운
  - 색상 구분: 파란색(>10분), 노란색(5-10분), 빨간색(<5분)
  - PENDING 상태에서만 표시

- 타이머 추가:
  - `ReservationsTab.tsx`: 대시보드 예약 탭
  - `ReservationsClient.tsx`: 예약 페이지

#### 4. 오너/운영자용 환불 기능 (제한 없음)

**백엔드 (Spring Boot)**

- `OwnerService.processOwnerRefund()` 메서드 추가

  - 당일 환불 가능
  - 전액 환불 가능
  - 환불 비율/금액 자유 조정
  - 본인 캠핑장 예약만 환불 가능

- `OwnerController` API 추가
  - `POST /api/v1/owner/payments/{paymentId}/refund`
  - OWNER, ADMIN 역할만 접근 가능

**프론트엔드 (Next.js)**

- `OwnerRefundModal.tsx` 생성

  - 환불 비율 선택: 100%, 80%, 50%, 30%
  - 커스텀 금액 입력 가능
  - 환불 사유 필수 입력
  - 실시간 환불 금액 계산
  - 오너 권한 안내 문구

- `OwnerReservationsTab.tsx` 수정

  - 환불 버튼 추가 (결제 완료 상태만)
  - 환불 모달 통합

- `ownerApi.ts` 업데이트
  - `processRefund()` API 추가

### 🔧 기술적 개선

**환불 정책 비교**

| 구분           | 사용자    | 오너/운영자 |
| -------------- | --------- | ----------- |
| 당일 환불      | ❌ 불가   | ✅ 가능     |
| 전액 환불      | ❌ 불가   | ✅ 가능     |
| 환불 금액 조정 | ❌ 불가   | ✅ 가능     |
| 환불 비율      | 자동 계산 | 자유 선택   |

**예약 타이머 개선**

- 체크 간격: 5분 → 1분 (더 정확한 타임아웃)
- 예약 취소 시 결제 상태 동기화
- 프론트엔드 실시간 타이머 표시

### 📝 파일 변경 목록

**백엔드 (backend/):**

```
src/main/java/com/campstation/camp/
├── reservation/
│   ├── service/PaymentService.java (환불 로직 추가)
│   ├── scheduler/ReservationCancellationScheduler.java (수정)
│   ├── dto/
│   │   ├── RefundRequest.java
│   │   └── RefundResponse.java
│   └── repository/PaymentRepository.java
├── owner/
│   ├── service/OwnerService.java (환불 메서드 추가)
│   └── controller/OwnerController.java (환불 API 추가)
```

**프론트엔드 (frontend/):**

```
src/
├── app/
│   └── reservations/
│       └── [id]/
│           └── payment/
│               └── page.tsx (신규 - 재결제 페이지)
├── components/
│   ├── dashboard/
│   │   ├── UserReservationDetailModal.tsx (신규)
│   │   ├── PaymentTimer.tsx (신규)
│   │   ├── ReservationsTab.tsx (수정)
│   │   └── DashboardClient.tsx (수정)
│   └── owner/
│       └── dashboard/
│           ├── OwnerRefundModal.tsx (신규)
│           └── tabs/
│               └── OwnerReservationsTab.tsx (수정)
├── lib/
│   └── api/
│       └── ownerApi.ts (환불 API 추가)
```

### 🐛 해결된 이슈

- 환불 시 예약이 자동 취소되지 않던 문제 해결
- 5분 타이머 간격으로 인한 지연 문제 해결 (1분으로 단축)
- 예약 취소 시 결제 상태가 동기화되지 않던 문제 해결
- 재결제 페이지 네비게이션 개선

### ⚠️ 주의사항

**환불 정책**

- 사용자: 체크인 당일 환불 불가, 전액 환불 불가
- 오너/운영자: 모든 제한 없음 (고객 서비스 대응용)

**예약 타이머**

- 30분 미결제 시 자동 취소
- 1분마다 체크 (이전 5분보다 정확)
- 예약 취소 시 결제도 자동 취소

---

## [2025-10-27] Owner Dashboard 개선 및 예약 관리 기능 추가

### 🎯 작업 목표

- Owner Dashboard를 사이트 중심으로 재설계
- 예약 달력 추가로 예약 현황 시각화
- 예약 상세 정보 모달 구현
- UI/UX 개선

### ✨ 주요 변경사항

#### 백엔드 (Spring Boot)

1. **OwnerDashboardStatsResponse DTO 재설계**

   - 사이트 중심 통계로 전환 (16개 필드)
   - `totalSites`, `availableSites`, `siteOccupancyRate` 추가
   - `averageRevenuePerSite`, `totalSiteRevenue` 추가
   - 사이트 타입별 통계 추가

2. **OwnerService 로직 개선**

   - 사이트 기반 통계 계산 로직 구현
   - 캠핑장별 → 사이트별 집계로 변경

3. **Owner 예약 API 추가**

   - `GET /v1/owner/reservations` 엔드포인트 추가
   - Owner가 소유한 모든 캠핑장의 예약 조회
   - `ReservationRepository.findByCampgroundIdIn()` 메서드 추가

4. **캐싱 설정**
   - `@Cacheable` 어노테이션으로 Dashboard 통계 캐싱 (TTL: 1분)

#### 프론트엔드 (Next.js)

1. **ReservationCalendar 컴포넌트 생성**

   - 월별 달력 뷰로 예약 현황 표시
   - 예약 상태별 색상 구분 (확정: 녹색, 대기: 노랑, 완료: 파랑, 취소: 빨강)
   - 날짜별 모든 예약 표시
   - 사이트 번호 명시적 표시
   - 예약 클릭 시 상세 모달 표시

2. **ReservationDetailModal 컴포넌트 생성**

   - 예약 번호, 상태 배지
   - 캠핑장 및 사이트 정보
   - 체크인/체크아웃 날짜, 총 숙박일
   - 예약자 정보 (이름, 이메일, 연락처)
   - 결제 금액 및 결제 수단
   - 특이사항 표시
   - Lucide React 아이콘 사용

3. **Owner Dashboard 개선**

   - 사이트 중심 통계 표시
   - 예약 달력 탭 추가
   - 예약 현황 탭에 사이트 번호 표시
   - Overview 탭의 다가오는 체크인에 사이트 번호 추가

4. **타입 정의 업데이트**

   - `Reservation` 인터페이스에 `userEmail`, `userPhone`, `paymentMethod`, `totalPrice` 필드 추가
   - 중복 타입 정의 제거 및 통합

5. **캐싱 최적화**

   - SSR에서 `revalidate` 옵션 추가 (캠핑장: 60초, 예약: 30초)

6. **텍스트 가독성 개선**
   - 모달 내 값 텍스트: `font-medium` → `font-semibold`
   - 레이블 크기: `text-sm` 적용
   - 중요 정보 강조 (총 숙박일: `text-lg font-bold`)

### 🔧 기술적 개선

- **의존성 관리**: Docker 컨테이너에서 `lucide-react` 패키지 설치 및 설정
- **코드 품질**: Native JavaScript로 날짜 포맷팅 구현 (date-fns 제거)
- **아이콘**: 이모지 대신 Lucide React 아이콘 사용

### 📝 파일 변경 목록

**백엔드:**

- `src/main/java/org/v1/owner/dto/OwnerDashboardStatsResponse.java`
- `src/main/java/org/v1/owner/service/OwnerService.java`
- `src/main/java/org/v1/owner/controller/OwnerController.java`
- `src/main/java/org/v1/reservation/repository/ReservationRepository.java`

**프론트엔드:**

- `src/components/owner/dashboard/ReservationCalendar.tsx` (신규)
- `src/components/owner/dashboard/ReservationDetailModal.tsx` (신규)
- `src/components/owner/dashboard/tabs/OwnerOverviewTab.tsx`
- `src/components/owner/dashboard/tabs/OwnerReservationsTab.tsx`
- `src/components/owner/dashboard/OwnerDashboardClient.tsx`
- `src/types/index.ts`
- `src/lib/api/ownerApi.ts`

### 🐛 해결된 이슈

- Owner Dashboard에서 사이트 정보 누락 문제 해결
- 예약 목록에 사이트 번호 미표시 문제 해결
- Docker 환경에서 패키지 의존성 불일치 문제 해결
- 모달 텍스트 가독성 저하 문제 해결

---

# 타임존 및 결제 타이머 개선 작업 완료

## 📅 작업 일자

2025년 10월 24일

## 🎯 작업 목표

1. 백엔드 UTC 저장 및 프론트엔드 로컬 시간 변환 구현
2. 30분 결제 타임아웃 기능 구현
3. 결제 타이머 시간 계산 버그 수정

---

## 1. 타임존 아키텍처 변경

### 문제점

- 기존: Asia/Seoul 하드코딩으로 국제 사용자 지원 불가
- 모든 시간이 한국 시간으로만 표시됨

### 해결 방안

**백엔드: UTC 저장 + 프론트엔드: 로컬 변환**

#### 백엔드 변경사항

1. **CampApplication.java**

   - JVM 기본 타임존을 UTC로 설정
   - JPA Auditing DateTimeProvider를 UTC로 설정

   ```java
   @PostConstruct
   public void init() {
     TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
   }

   @Bean
   public DateTimeProvider auditingDateTimeProvider() {
     return () -> Optional.of(LocalDateTime.now(ZoneOffset.UTC));
   }
   ```

2. **application.yml**

   - Hibernate JDBC 타임존: UTC
   - Jackson 직렬화 타임존: UTC

   ```yaml
   hibernate.jdbc.time_zone: UTC
   jackson.time-zone: UTC
   jackson.date-format: yyyy-MM-dd'T'HH:mm:ss'Z'
   ```

3. **Reservation.java**
   - Hibernate annotations → Spring Data JPA auditing
   - `@CreationTimestamp` → `@CreatedDate`
   - `@UpdateTimestamp` → `@LastModifiedDate`

#### 프론트엔드 변경사항

1. **dateUtils.ts 통합**

   - timeUtils.ts를 dateUtils.ts로 통합
   - 모든 날짜/시간 함수가 UTC → 로컬 자동 변환
   - **핵심**: LocalDateTime의 Z 없는 ISO 문자열 처리

   ```typescript
   // Z가 없는 경우 (LocalDateTime), UTC로 강제 변환
   const normalizedDateString = dateString.endsWith("Z")
     ? dateString
     : dateString + "Z";
   const date = new Date(normalizedDateString);
   ```

2. **주요 유틸리티 함수**
   - `formatToLocalTime()`: ISO 8601 → 사용자 로컬 시간
   - `formatDateTimeKorean()`: 한국어 형식 표시
   - `formatDateOnly()`: 날짜만 표시
   - `formatTimeOnly()`: 시간만 표시
   - `formatRelativeTime()`: 상대 시간 ("5분 전")
   - `formatDateKorean()`: 레거시 호환 (Java 배열 지원)

### 작동 원리

```
백엔드: LocalDateTime → "2025-10-24T03:30:00" (Z 없음)
↓
프론트: "2025-10-24T03:30:00" + "Z" → "2025-10-24T03:30:00Z"
↓
JavaScript: UTC로 해석 → 사용자의 로컬 시간으로 변환
↓
한국: 12:30, 미국 동부: 23:30, 일본: 12:30
```

---

## 2. 30분 결제 타임아웃 기능

### 구현 내용

1. **백엔드 스케줄러**

   - `ReservationCancellationScheduler.java` 생성
   - 매 5분마다 실행 (`@Scheduled(cron = "0 */5 * * * *")`)
   - 30분 초과 PENDING 예약 자동 취소

   ```java
   @Scheduled(cron = "0 */5 * * * *")
   public void cancelUnpaidReservations() {
     LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(30);
     List<Reservation> unpaidReservations =
       reservationRepository.findByStatusAndCreatedAtBefore(PENDING, cutoffTime);
     // 자동 취소 처리
   }
   ```

2. **프론트엔드 타이머**
   - `PaymentTimer.tsx` 컴포넌트 생성
   - 실시간 카운트다운 표시
   - 색상 구분: 파란색(>10분), 노란색(5-10분), 빨간색(<5분)
   - ReservationsTab과 PaymentModal에 통합

---

## 3. 결제 타이머 버그 수정

### 문제점

예약 직후에도 "시간 만료"로 표시

### 원인

```
백엔드: LocalDateTime → "2025-10-23T12:30:00" (Z 없음)
↓
JavaScript: new Date("2025-10-23T12:30:00") → 로컬 12:30으로 해석
↓
한국(UTC+9)에서는 실제 UTC보다 9시간 빠르게 계산
↓
이미 만료된 것처럼 보임 ❌
```

### 해결

**PaymentTimer.tsx & PaymentModal.tsx 수정**

```typescript
// Z 추가하여 UTC로 강제 변환
const normalizedCreatedAt = createdAt.endsWith("Z")
  ? createdAt
  : createdAt + "Z";
const createdTime = new Date(normalizedCreatedAt).getTime();
```

---

## 4. 컴포넌트별 수정 사항

### 직접 수정된 컴포넌트

- ✅ `PaymentConfirmation.tsx`: `new Date().toLocaleString()` → `formatDateKorean()`
- ✅ `OwnerReservationsTab.tsx`: `new Date().toLocaleDateString()` → `formatDateOnly()`
- ✅ `DateRangePicker.tsx`: `new Date().toLocaleDateString()` → `formatToLocalTime()`
- ✅ `PaymentTimer.tsx`: Z 없는 ISO 문자열 처리 추가
- ✅ `PaymentModal.tsx`: Z 없는 ISO 문자열 처리 추가

### 자동 지원되는 컴포넌트 (formatDateKorean 사용)

- PaymentHistory.tsx
- ReservationsTab.tsx
- ReviewsTab.tsx
- FavoritesTab.tsx
- ReviewsSection.tsx
- ReservationsClient.tsx
- GuestReservationLookupClient.tsx

---

## 5. 테스트 결과

### dateUtils 테스트

```bash
✓ ISO 8601 형식을 로컬 시간으로 변환
✓ 날짜만 있는 형식 처리
✓ 한국어 형식 변환
✓ 상대 시간 표시
✓ Java LocalDateTime 배열 처리
✓ Z 있는 UTC 시간 처리
✓ Z 없는 UTC 시간 처리 (LocalDateTime)

총 14개 테스트 통과 ✅
```

### PaymentTimer 테스트

```bash
✓ Z 없는 UTC 시간 처리
  - 5분 전 예약: 25분 남음 ✅
✓ Z 있는 UTC 시간 처리
  - 5분 전 예약: 25분 남음 ✅
✓ 방금 생성된 예약
  - 1초 전: 29분 남음 ✅
✓ 30분 경과된 예약
  - 31분 전: 만료 (음수) ✅

총 4개 테스트 통과 ✅
```

---

## 6. 영향 및 개선 사항

### 긍정적 영향 ✅

- **국제화 지원**: 전 세계 어디서든 로컬 시간으로 표시
- **일광 절약 시간(DST) 자동 처리**
- **서버 간 시간 동기화 간소화**: 모두 UTC 기준
- **타임존 관련 버그 감소**
- **사용자 경험 향상**: 친숙한 로컬 시간 표시

### 주의사항 ⚠️

- **기존 데이터**: 이미 Asia/Seoul로 저장된 데이터는 마이그레이션 필요
- **개발 환경**: 개발자의 로컬 시간으로 표시됨 (의도된 동작)
- **디버깅**: 서버 로그는 UTC, 브라우저는 로컬 시간

---

## 7. 파일 변경 목록

### 백엔드

```
src/main/java/com/campstation/camp/
├── CampApplication.java (수정)
├── reservation/
│   ├── domain/Reservation.java (수정)
│   ├── repository/ReservationRepository.java (메서드 추가)
│   └── scheduler/ReservationCancellationScheduler.java (신규)
└── resources/
    └── application.yml (수정)
```

### 프론트엔드

```
src/
├── lib/
│   ├── dateUtils.ts (수정 - timeUtils 통합)
│   └── __tests__/
│       └── dateUtils.test.ts (신규)
├── components/
│   ├── PaymentConfirmation.tsx (수정)
│   ├── PaymentModal.tsx (수정)
│   ├── campground-detail/
│   │   └── DateRangePicker.tsx (수정)
│   ├── owner/dashboard/tabs/
│   │   └── OwnerReservationsTab.tsx (수정)
│   └── dashboard/
│       ├── PaymentTimer.tsx (수정)
│       └── __tests__/
│           └── PaymentTimer.test.ts (신규)
└── 문서/
    ├── TIMEZONE_MIGRATION.md (신규)
    ├── UTC_FIX_SUMMARY.md (신규)
    └── PAYMENT_TIMER_FIX.md (신규)
```

---

## 8. 배포 체크리스트

### 백엔드

- [x] UTC 타임존 설정 확인
- [x] JPA Auditing 설정 확인
- [x] 스케줄러 실행 확인
- [x] 컴파일 에러 없음
- [ ] 프로덕션 배포 전 기존 데이터 마이그레이션

### 프론트엔드

- [x] dateUtils 함수 테스트 통과
- [x] PaymentTimer 테스트 통과
- [x] Lint 에러 없음
- [x] 빌드 성공
- [ ] 실제 환경에서 타이머 동작 확인

---

## 9. 다음 단계

1. **모니터링**

   - 타임존 관련 오류 로그 확인
   - 자동 취소 스케줄러 동작 확인
   - 사용자 피드백 수집

2. **최적화**

   - 대량 데이터에 대한 스케줄러 성능 테스트
   - 타이머 UI/UX 개선

3. **문서화**
   - API 문서에 "모든 시간은 UTC로 반환됨" 명시
   - 사용자 가이드 업데이트

---

## 10. 참고 자료

- [ISO 8601 표준](https://en.wikipedia.org/wiki/ISO_8601)
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Spring Data JPA Auditing](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#auditing)
- [JavaScript Date 타임존 처리](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

---

## ✅ 작업 완료

- 백엔드 UTC 저장 구현
- 프론트엔드 로컬 시간 변환 구현
- 30분 결제 타임아웃 기능 구현
- 결제 타이머 버그 수정
- 전체 테스트 통과
- 문서화 완료
