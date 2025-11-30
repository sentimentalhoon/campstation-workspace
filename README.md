# WorkSpace

개인 프로젝트 모음

## 📁 Projects

### 🏕️ [Campground](./campground/)
캠프장 예약 시스템
- **Tech Stack**: Spring Boot + Next.js
- **Domain**: mycamp.duckdns.org
- **Ports**: 3000 (frontend), 8080 (backend)

### 👥 [Community](./community/)
PC방 블랙리스트 커뮤니티
- **Tech Stack**: Ktor + Vue 3
- **Domain**: mycommunity.duckdns.org
- **Ports**: 3001 (frontend), 8081 (backend)

## 🚀 Infrastructure

공유 인프라 설정은 [`infrastructure/`](./infrastructure/) 폴더에 있습니다.
- Nginx 리버스 프록시 설정
- SSL 인증서 관리
- 도메인 라우팅

## 📝 Development

각 프로젝트는 독립적으로 개발 및 배포됩니다.

```bash
# Campground 개발
cd campground
docker-compose up -d

# Community 개발
cd community
docker-compose up -d
```
