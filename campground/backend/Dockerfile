# ================================
# CampStation Backend - Multi-Stage Dockerfile
# ================================
# 최적화된 Spring Boot 애플리케이션 컨테이너화
# - Multi-stage build로 이미지 크기 최적화
# - Security hardening 적용
# - Non-root 사용자 실행
# - Health check 포함

# ================================
# Build Stage
# ================================
FROM eclipse-temurin:21-jdk-alpine AS builder

# 메타데이터
LABEL maintainer="CampStation Team" \
      description="CampStation Backend - Spring Boot Application" \
      version="1.0.0"

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 캐시 활용을 위한 의존성 복사
COPY gradlew .
COPY gradle gradle
COPY gradle/wrapper gradle/wrapper
COPY build.gradle.kts settings.gradle.kts ./

# 의존성 다운로드 (소스 코드 변경 시 캐시 활용)
RUN chmod +x gradlew
RUN ./gradlew dependencies --no-daemon --parallel

# 소스 코드 복사 및 빌드
COPY src src
RUN ./gradlew bootJar --no-daemon --parallel -x test \
    && mkdir -p /app/build/dependency \
    && cd /app/build/dependency \
    && jar -xf ../libs/*.jar

# ================================
# Runtime Stage
# ================================
FROM eclipse-temurin:21-jre-alpine AS runtime

# 메타데이터
LABEL maintainer="CampStation Team" \
      description="CampStation Backend Runtime" \
      version="1.0.0"

# 보안: root가 아닌 사용자 생성
RUN addgroup -g 1001 -S appgroup \
    && adduser -u 1001 -S appuser -G appgroup

# Alpine에 wget 설치
RUN apk add --no-cache wget

# 작업 디렉토리 및 권한 설정
WORKDIR /app
RUN chown -R appuser:appgroup /app
USER appuser

# 애플리케이션 JAR 복사
COPY --from=builder --chown=appuser:appgroup /app/build/libs/*.jar app.jar

# 애플리케이션 포트 노출
EXPOSE 8080

# JVM 옵션 설정 (컨테이너 최적화)
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+UseG1GC \
               -XX:+UseCompressedOops \
               -XX:+OptimizeStringConcat \
               -Djava.security.egd=file:/dev/./urandom \
               -Dspring.jmx.enabled=false"

# 헬스체크
HEALTHCHECK --interval=600s --timeout=5s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 애플리케이션 실행
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]