# CampStation Frontend 배포 스크립트
# Next.js 16 & React 19 업데이트 배포

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "CampStation Frontend 배포 시작" -ForegroundColor Cyan
Write-Host "Next.js 16.0.1 + React 19.2.0" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 작업 디렉토리로 이동
$workspaceRoot = "c:\Users\say4u\WorkSpace"
Set-Location $workspaceRoot

Write-Host "[1/6] Git 상태 확인..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "[2/6] 최근 커밋 확인..." -ForegroundColor Yellow
git log --oneline -5
Write-Host ""

Write-Host "[3/6] 기존 프론트엔드 컨테이너 중지..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml -f docker-compose.prod.yml stop frontend
Write-Host "✓ 컨테이너 중지 완료" -ForegroundColor Green
Write-Host ""

Write-Host "[4/6] 프론트엔드 이미지 재빌드 (캐시 없이)..." -ForegroundColor Yellow
Write-Host "⚠️  이 작업은 5-10분 소요될 수 있습니다..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 이미지 빌드 성공" -ForegroundColor Green
} else {
    Write-Host "✗ 이미지 빌드 실패!" -ForegroundColor Red
    Write-Host "로그를 확인하세요." -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[5/6] 프론트엔드 컨테이너 시작..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 컨테이너 시작 성공" -ForegroundColor Green
} else {
    Write-Host "✗ 컨테이너 시작 실패!" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[6/6] 컨테이너 상태 확인..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
docker ps | Select-String "frontend"
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "배포 완료!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "다음 명령어로 로그를 확인하세요:" -ForegroundColor Yellow
Write-Host "docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f frontend" -ForegroundColor White
Write-Host ""

Write-Host "웹사이트 접속:" -ForegroundColor Yellow
Write-Host "http://mycamp.duckdns.org" -ForegroundColor White
Write-Host ""

Write-Host "배포 검증 체크리스트:" -ForegroundColor Yellow
Write-Host "  [ ] 웹사이트 접속 확인" -ForegroundColor White
Write-Host "  [ ] 캠핑장 카드 하트 버튼 즉시 반응 확인" -ForegroundColor White
Write-Host "  [ ] 대시보드 찜하기 해제 즉시 반응 확인" -ForegroundColor White
Write-Host "  [ ] 브라우저 콘솔 에러 없음 확인" -ForegroundColor White
Write-Host ""
