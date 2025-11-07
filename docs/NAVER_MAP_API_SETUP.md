# 네이버 지도 API 설정 가이드

## 📋 네이버 클라우드 플랫폼 Client ID 발급

### 1단계: 네이버 클라우드 플랫폼 가입

1. [Naver Cloud Platform](https://www.ncloud.com/) 접속
2. 회원가입 또는 로그인
3. 우측 상단 "콘솔" 클릭

### 2단계: Application 등록

1. 콘솔 → **Services** → **AI·NAVER API** → **AI·NAVER API** 선택
2. **Application 등록** 버튼 클릭
3. Application 정보 입력:

   - **Application 이름**: CampStation
   - **Service 선택**:
     - ✅ Maps
     - ✅ Web Dynamic Map (필수)
     - ✅ Geocoding (주소 검색용, 선택)
   - **서비스 환경**: Web Service 선택
   - **웹 서비스 URL**:
     - 개발: `http://localhost:3000`
     - 운영: `https://your-domain.com`

4. **등록** 버튼 클릭

### 3단계: Client ID 확인

1. 등록된 Application 목록에서 생성한 앱 선택
2. **인증 정보** 탭에서 Client ID 확인
3. Client ID 복사 (예: `your_client_id_here`)

### 4단계: 환경 변수 설정

프로젝트 루트의 `.env.local` 파일에 추가:

```bash
# Naver Maps API
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_client_id_here
```

**주의사항**:

- Client ID는 공개되어도 안전함 (프론트엔드에서 사용)
- Client Secret은 불필요 (Web Dynamic Map은 Client ID만 사용)
- 환경 변수명은 반드시 `NEXT_PUBLIC_` 접두사 필요 (Next.js 클라이언트 노출용)

---

## 📊 API 사용량 및 가격

### 무료 할당량

- **Map Load**: 월 10만 건 무료
- **Geocoding**: 월 10만 건 무료

### 과금 정책 (무료 할당량 초과 시)

- Map Load: 건당 0.5원
- Geocoding: 건당 5원

### 사용량 모니터링

1. 네이버 클라우드 플랫폼 콘솔 접속
2. **AI·NAVER API** → **Application 관리**
3. **통계** 탭에서 일별/월별 사용량 확인

---

## 🔧 개발 환경 설정

### 허용 도메인 추가 (CORS)

네이버 지도는 등록된 도메인에서만 작동합니다:

1. 네이버 클라우드 플랫폼 콘솔
2. Application 관리 → 해당 앱 선택
3. **웹 서비스 URL** 수정:
   ```
   http://localhost:3000
   http://localhost:3001
   https://campstation.com
   https://www.campstation.com
   ```

### 테스트 방법

`.env.local` 설정 후:

```bash
# 개발 서버 실행
npm run dev

# 브라우저 콘솔에서 확인
console.log(process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID)
```

---

## 📚 참고 자료

- [Naver Maps API 가이드](https://navermaps.github.io/maps.js.ncp/)
- [Web Dynamic Map 시작하기](https://navermaps.github.io/maps.js.ncp/docs/tutorial-1-Getting-Started.html)
- [API 레퍼런스](https://navermaps.github.io/maps.js.ncp/docs/index.html)
- [예제 코드](https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Examples.html)

---

**작성일**: 2025-11-07  
**상태**: ✅ 완료
