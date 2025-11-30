package com.campstation.camp;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.campstation.camp.shared.validation.InputValidator;

import jakarta.annotation.PostConstruct;

/**
 * CampStation - 캠핑장 예약 관리 시스템
 * 
 * 주요 기능:
 * - 캠핑장 관리 (등록, 수정, 삭제, 조회)
 * - 캠핑 사이트 관리
 * - 예약 관리
 * - 사용자 관리
 * - 리뷰 및 평점 시스템
 * 
 * 기술 스택:
 * - Spring Boot 3.5.6
 * - Java 21 (Virtual Threads, Records, Pattern Matching)
 * - JPA/Hibernate
 * - H2 Database (개발용)
 * - Spring Security
 * - Spring Cache
 * - OpenAPI 3.0 (Swagger)
 */
@SpringBootApplication
@EnableJpaAuditing(dateTimeProviderRef = "auditingDateTimeProvider")
@EnableCaching
@EnableScheduling
public class CampApplication {

	@Bean
	public InputValidator inputValidator() {
		return new InputValidator();
	}

	/**
	 * JPA Auditing을 위한 DateTimeProvider 빈
	 * UTC 시간으로 현재 시간을 제공합니다.
	 * 프론트엔드에서 사용자의 로컬 타임존으로 변환합니다.
	 */
	@Bean
	public DateTimeProvider auditingDateTimeProvider() {
		return () -> Optional.of(LocalDateTime.now(ZoneOffset.UTC));
	}

	/**
	 * 애플리케이션 초기화 시 타임존을 UTC로 설정
	 * JVM 전체의 기본 타임존을 UTC로 설정하여
	 * 일관된 시간 처리를 보장합니다.
	 */
	@PostConstruct
	public void init() {
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
	}

	public static void main(String[] args) {
		// Java 21 Virtual Threads 활성화
		System.setProperty("spring.threads.virtual.enabled", "true");
		SpringApplication.run(CampApplication.class, args);
	}

}
