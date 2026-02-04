plugins {
	java
	checkstyle
	id("org.springframework.boot") version "3.5.10"
	id("io.spring.dependency-management") version "1.1.7"
	id("org.flywaydb.flyway") version "10.20.1"
}

// Checkstyle 설정
checkstyle {
	toolVersion = "10.12.1"
	configFile = file("${rootDir}/checkstyle.xml")
	isIgnoreFailures = false
	maxWarnings = 0
}

tasks.withType<Checkstyle> {
	reports {
		xml.required.set(false)
		html.required.set(true)
	}
}

group = "com.campstation"
version = "0.0.1-SNAPSHOT"
description = "CampStation "

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	// Spring Boot Starters
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-cache")
	implementation("org.springframework.boot:spring-boot-starter-actuator")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-oauth2-client")  // OAuth2 Client 활성화
	implementation("org.springframework.boot:spring-boot-starter-data-redis")
	implementation("org.springframework.boot:spring-boot-starter-mail")
	implementation("org.springframework.boot:spring-boot-starter-json")
	implementation("org.springframework.boot:spring-boot-starter-aop")  // AOP 지원
	
	// Database
	implementation("org.springframework.boot:spring-boot-starter-jdbc")  // Flyway를 위한 JDBC starter
	implementation("org.flywaydb:flyway-core")  // Flyway 의존성 추가
	implementation("org.flywaydb:flyway-database-postgresql")  // PostgreSQL 지원 추가
	runtimeOnly("com.h2database:h2")
	runtimeOnly("org.postgresql:postgresql")
	
	// Documentation
	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.7.0")
	
	// JWT
	implementation("io.jsonwebtoken:jjwt-api:0.12.6")
	runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
	runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")
	
	// PDF Generation
	implementation("com.itextpdf:itext-core:8.0.2")
	
	// SMS (Twilio)
	implementation("com.twilio.sdk:twilio:9.13.0")
	
	// 포트원(PortOne) PG 통합
	implementation("com.squareup.okhttp3:okhttp:4.12.0")
	implementation("com.google.code.gson:gson:2.10.1")
	
	// AWS S3 (MinIO 호환)
	implementation("software.amazon.awssdk:s3:2.25.11")
	implementation("software.amazon.awssdk:apache-client:2.25.11")
	
	// Hibernate Types for JSON support
	implementation("com.vladmihalcea:hibernate-types-60:2.21.1")
	
	// Cache (Caffeine)
	implementation("com.github.ben-manes.caffeine:caffeine:3.1.8")

	// Rate Limiting (Bucket4j with Redis)
	implementation("com.bucket4j:bucket4j-core:8.10.1")
	implementation("com.bucket4j:bucket4j-redis:8.10.1")

	// Utilities
	compileOnly("org.projectlombok:lombok:1.18.30")
	annotationProcessor("org.projectlombok:lombok:1.18.30")
	
	// Test
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.security:spring-security-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
