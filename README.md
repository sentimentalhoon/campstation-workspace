# CampStation

A full-stack camping reservation management system built with Spring Boot and Next.js.

## Architecture

- **Backend**: Spring Boot 3.5.6, Java 21, PostgreSQL
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Authentication**: JWT with refresh tokens
- **Deployment**: Docker, Docker Compose

## Features

### Backend
- RESTful API with Spring Boot
- JWT authentication with refresh token flow
- Campground and site management
- Reservation system
- User management and reviews
- PostgreSQL database with H2 for testing
- Comprehensive unit and integration tests

### Frontend
- Modern React with Next.js App Router
- TypeScript for type safety
- Responsive design with Tailwind CSS
- JWT authentication with automatic token refresh
- Protected routes and user dashboard
- API integration with error handling

## Quick Start

### Prerequisites
- Java 21
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (for production)

### Development Setup

1. **Clone the repositories**:
```bash
git clone https://github.com/your-username/campstation-backend.git backend
git clone https://github.com/your-username/campstation-frontend.git frontend
```

2. **Start the backend**:
```bash
cd backend
./gradlew bootRun
```
Backend runs on http://localhost:8080

3. **Start the frontend**:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

4. **Database**:
For development, H2 in-memory database is used automatically.
For production, configure PostgreSQL in `application-prod.yml`.

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/v3/api-docs

## Testing

### Backend Tests
```bash
cd backend
./gradlew test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Environment Variables

### Backend
Create `backend/src/main/resources/application-local.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/campstation
    username: your_db_user
    password: your_db_password
  jpa:
    hibernate:
      ddl-auto: update
```

### Frontend
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Deployment

### Backend
```bash
cd backend
./gradlew build
java -jar build/libs/campstation-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Docker
```bash
# Backend
cd backend
docker build -t campstation/backend .

# Frontend
cd frontend
docker build -t campstation/frontend .

# Run with Docker Compose
docker-compose up
```

## Project Structure

```
campstation/
├── backend/
│   ├── src/main/java/com/campstation/camp/
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Data access
│   │   ├── domain/         # JPA entities
│   │   ├── dto/            # Data transfer objects
│   │   ├── config/         # Configuration classes
│   │   ├── security/       # JWT security
│   │   └── exception/      # Exception handlers
│   ├── src/test/           # Unit and integration tests
│   └── build.gradle.kts    # Gradle build file
└── frontend/
    ├── src/
    │   ├── app/            # Next.js pages
    │   ├── components/     # React components
    │   ├── lib/            # API utilities
    │   └── types/          # TypeScript types
    ├── public/             # Static assets
    └── package.json        # Node dependencies
```

## Contributing

1. Fork the repositories
2. Create feature branches
3. Make changes with tests
4. Submit pull requests
5. Ensure CI passes

## License

MIT License