# NAVER Maps API 설정 체크리스트

## 현재 상태
- Client ID: `jq20atlff0`
- 도메인: `https://mycamp.duckdns.org`
- 에러: Authentication Failed (200)

## 필수 확인 사항

### 1. 콘솔 접속
URL: https://console.ncloud.com/naver-service/application

### 2. Application 설정 확인

#### ✅ 체크 1: 서비스 선택
- [ ] **Web Dynamic Map** 체크되어 있는가?
- [ ] Mobile Dynamic Map은 체크 해제되어 있는가?

#### ✅ 체크 2: Web Service URL 등록
정확히 다음과 같이 입력되어 있는가?

```
https://mycamp.duckdns.org
```

**주의사항**:
- ❌ 끝에 슬래시(`/`) 없어야 함
- ❌ 포트 번호(`:443`) 없어야 함
- ❌ 경로(`/map`) 없어야 함
- ✅ `https://` 프로토콜 포함 필수

#### ✅ 체크 3: 설정 저장 후 대기
- [ ] 저장 버튼 클릭했는가?
- [ ] 5-10분 대기했는가? (설정 반영 시간)

### 3. 추가 등록 (로컬 개발용)

로컬 테스트를 위해 추가 등록:
```
http://localhost:3000
```

### 4. 잘못된 설정 예시

#### ❌ 틀린 예시들:
```
https://mycamp.duckdns.org/         (끝에 슬래시)
https://mycamp.duckdns.org/map      (경로 포함)
mycamp.duckdns.org                  (프로토콜 없음)
http://mycamp.duckdns.org           (https 아닌 http)
```

#### ✅ 올바른 예시:
```
https://mycamp.duckdns.org
```

## 트러블슈팅

### 문제 1: "설정을 저장했는데도 안 됨"
**해결**: 브라우저 캐시 삭제 후 재접속
1. Chrome: Ctrl+Shift+Delete
2. 캐시된 이미지 및 파일 삭제
3. 브라우저 완전 종료 후 재시작

### 문제 2: "10분 기다렸는데도 안 됨"
**해결**: Application 삭제 후 재생성
1. 기존 Application 삭제
2. 새 Application 생성 (이름: CampStation-v2)
3. Web Service URL 정확히 입력
4. 새 Client ID로 환경 변수 업데이트

### 문제 3: "올바르게 설정했는데도 계속 실패"
**가능한 원인**:
1. 도메인 SSL 인증서 문제
2. 네이버 클라우드 플랫폼 계정 인증 문제
3. 무료 체험 계정 제한

**확인 방법**:
```bash
# SSL 인증서 확인
curl -I https://mycamp.duckdns.org

# 200 OK 응답이 와야 정상
```

## 다음 단계

설정을 모두 확인한 후:

1. 저장 버튼 클릭
2. **10분 대기**
3. 브라우저 캐시 삭제
4. https://mycamp.duckdns.org/map 재접속
5. F12 개발자 도구 Console 탭에서 에러 확인

여전히 안 되면 스크린샷을 찍어서 공유해주세요:
- Application 상세 설정 화면
- Web Service URL 섹션
- 브라우저 Console 에러 메시지
