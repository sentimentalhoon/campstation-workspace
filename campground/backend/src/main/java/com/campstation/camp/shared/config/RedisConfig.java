package com.campstation.camp.shared.config;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.campstation.camp.shared.dto.PageResponse;
import com.campstation.camp.user.dto.UserResponseDto;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.annotation.PostConstruct;

@Configuration
@EnableCaching
public class RedisConfig {

    private static final Logger log = LoggerFactory.getLogger(RedisConfig.class);

    @Value("${spring.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.redis.port:6379}")
    private int redisPort;

    @Value("${spring.redis.password:}")
    private String redisPassword;

    @Value("${spring.redis.database:0}")
    private int redisDatabase;

    @PostConstruct
    public void init() {
        log.info("🔄 RedisConfig initialized - Redis Host: {}, Port: {}, Database: {}", redisHost, redisPort, redisDatabase);
    }

    @Bean
    @Primary
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
        redisConfig.setHostName(redisHost);
        redisConfig.setPort(redisPort);
        redisConfig.setDatabase(redisDatabase);
        if (!redisPassword.isEmpty()) {
            redisConfig.setPassword(redisPassword);
        }

        LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder().build();
        LettuceConnectionFactory factory = new LettuceConnectionFactory(redisConfig, clientConfig);
        factory.afterPropertiesSet();
        log.info("✅ RedisConnectionFactory created with host: {}, port: {}, database: {}", redisHost, redisPort, redisDatabase);
        return factory;
    }

    @Bean
    public ObjectMapper redisObjectMapper() {
        return JsonMapper.builder()
                .addModule(new JavaTimeModule())
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
                .build();
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory,
                                                       ObjectMapper redisObjectMapper) {
        // Redis 연결 정보 로깅
        log.info("🔴 Redis Connection Factory Information:");
        log.info("  - Connection Factory Class: {}", connectionFactory.getClass().getSimpleName());

        // Lettuce 연결 팩토리인 경우 상세 정보 로깅
        if (connectionFactory instanceof org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory lettuceFactory) {
            var config = lettuceFactory.getStandaloneConfiguration();
            if (config != null) {
                log.info("  - Redis Host: {}", config.getHostName());
                log.info("  - Redis Port: {}", config.getPort());
                log.info("  - Redis Database: {}", config.getDatabase());
                log.info("  - Redis Password: {}", config.getPassword() != null ? "[PROTECTED]" : "null");
            }

            var clientConfig = lettuceFactory.getClientConfiguration();
            if (clientConfig != null) {
                log.info("  - Client Name: {}", clientConfig.getClientName().orElse("default"));
            }
        }

        var template = new RedisTemplate<String, Object>();
        template.setConnectionFactory(connectionFactory);

        var serializer = new Jackson2JsonRedisSerializer<>(redisObjectMapper, Object.class);

        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);

        template.afterPropertiesSet();
        log.info("✅ RedisTemplate configured successfully");
        return template;
    }

    @Bean("redisCacheManager")
    public RedisCacheManager redisCacheManager(RedisConnectionFactory connectionFactory,
                                          ObjectMapper redisObjectMapper) {

        // 기본 직렬화기
        var defaultSerializer = new Jackson2JsonRedisSerializer<>(redisObjectMapper, Object.class);

        // 전용 직렬화기
        var pageResponseSerializer = new Jackson2JsonRedisSerializer<>(redisObjectMapper, PageResponse.class);
        var userResponseSerializer = new Jackson2JsonRedisSerializer<>(redisObjectMapper, UserResponseDto.class);

        // 기본 설정
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(defaultSerializer))
                .disableCachingNullValues() // null 값 캐싱 비활성화
                .entryTtl(Duration.ofHours(2)); // 기본 TTL: 2시간

        // 캐시별 TTL 설정 (1단계: Quick Wins)
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        
        // 2. 리뷰 통계 - 1시간 (DB 집계 쿼리 제거)
        cacheConfigs.put("reviewStatistics", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigs.put("averageRatings", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigs.put("reviewCounts", defaultConfig.entryTtl(Duration.ofHours(1)));
        
        // 3. 찜하기 목록 - 5분 (자주 변경될 수 있음)
        cacheConfigs.put("userFavorites", defaultConfig.serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(pageResponseSerializer)
        ).entryTtl(Duration.ofMinutes(5)));
        cacheConfigs.put("favoriteStatus", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigs.put("favoriteCounts", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigs.put("userFavoriteIds", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        
        // 4. 인기 캠핑장 - 6시간 (순위는 천천히 변경)
        cacheConfigs.put("popularCampgrounds", defaultConfig.entryTtl(Duration.ofHours(6)));
        
        // 기존 캐시 설정 유지
        cacheConfigs.put("campgrounds", defaultConfig.serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(pageResponseSerializer)
        ).entryTtl(Duration.ofHours(4)));
        cacheConfigs.put("users", defaultConfig.serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(userResponseSerializer)
        ).entryTtl(Duration.ofHours(4)));
        cacheConfigs.put("userDetails", defaultConfig.entryTtl(Duration.ofHours(4)));
        cacheConfigs.put("reservations", defaultConfig.entryTtl(Duration.ofMinutes(5)));

        log.info("✅ RedisCacheManager 설정 완료 - {} 개의 캐시 설정", cacheConfigs.size());
        cacheConfigs.forEach((name, config) -> 
            log.info("  📦 캐시 '{}' - TTL: {}", name, config.getTtl())
        );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .transactionAware() // 트랜잭션 지원
                .build();
    }
}