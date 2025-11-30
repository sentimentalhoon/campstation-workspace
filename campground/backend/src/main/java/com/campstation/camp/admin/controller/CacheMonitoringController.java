package com.campstation.camp.admin.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.shared.dto.CommonResponse;
import com.github.benmanes.caffeine.cache.stats.CacheStats;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 캐시 모니터링 컨트롤러
 * Caffeine 캐시 통계 및 관리 기능 제공
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/cache")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Cache Monitoring", description = "캐시 모니터링 및 관리 API")
public class CacheMonitoringController {

    private final CacheManager cacheManager;

    /**
     * 모든 캐시 통계 조회
     */
    @GetMapping("/stats")
    @Operation(summary = "모든 캐시 통계 조회", description = "Caffeine 캐시의 통계 정보를 조회합니다")
    public ResponseEntity<CommonResponse<Map<String, Object>>> getAllCacheStats() {
        log.info("📊 모든 캐시 통계 조회 요청");
        
        Map<String, Object> result = new HashMap<>();
        Map<String, Map<String, Object>> cacheStats = new HashMap<>();

        cacheManager.getCacheNames().forEach(cacheName -> {
            var cache = cacheManager.getCache(cacheName);
            if (cache instanceof CaffeineCache) {
                CaffeineCache caffeineCache = (CaffeineCache) cache;
                com.github.benmanes.caffeine.cache.Cache<Object, Object> nativeCache = 
                    caffeineCache.getNativeCache();
                
                CacheStats stats = nativeCache.stats();
                
                Map<String, Object> cacheInfo = new HashMap<>();
                cacheInfo.put("hitCount", stats.hitCount());
                cacheInfo.put("missCount", stats.missCount());
                cacheInfo.put("hitRate", String.format("%.2f%%", stats.hitRate() * 100));
                cacheInfo.put("missRate", String.format("%.2f%%", stats.missRate() * 100));
                cacheInfo.put("loadSuccessCount", stats.loadSuccessCount());
                cacheInfo.put("loadFailureCount", stats.loadFailureCount());
                cacheInfo.put("evictionCount", stats.evictionCount());
                cacheInfo.put("estimatedSize", nativeCache.estimatedSize());
                
                cacheStats.put(cacheName, cacheInfo);
            }
        });

        result.put("cacheCount", cacheStats.size());
        result.put("caches", cacheStats);

        return ResponseEntity.ok(CommonResponse.success(result));
    }

    /**
     * 특정 캐시 통계 조회
     */
    @GetMapping("/stats/{cacheName}")
    @Operation(summary = "특정 캐시 통계 조회", description = "지정된 캐시의 상세 통계를 조회합니다")
    public ResponseEntity<CommonResponse<Map<String, Object>>> getCacheStats(
            @PathVariable String cacheName) {
        log.info("📊 캐시 '{}' 통계 조회 요청", cacheName);
        
        var cache = cacheManager.getCache(cacheName);
        if (cache == null) {
            return ResponseEntity.notFound().build();
        }

        if (!(cache instanceof CaffeineCache)) {
            Map<String, Object> info = new HashMap<>();
            info.put("message", "Caffeine 캐시가 아닙니다");
            info.put("cacheType", cache.getClass().getSimpleName());
            return ResponseEntity.ok(CommonResponse.success(info));
        }

        CaffeineCache caffeineCache = (CaffeineCache) cache;
        com.github.benmanes.caffeine.cache.Cache<Object, Object> nativeCache = 
            caffeineCache.getNativeCache();
        
        CacheStats stats = nativeCache.stats();
        
        Map<String, Object> result = new HashMap<>();
        result.put("cacheName", cacheName);
        result.put("hitCount", stats.hitCount());
        result.put("missCount", stats.missCount());
        result.put("requestCount", stats.requestCount());
        result.put("hitRate", String.format("%.2f%%", stats.hitRate() * 100));
        result.put("missRate", String.format("%.2f%%", stats.missRate() * 100));
        result.put("loadSuccessCount", stats.loadSuccessCount());
        result.put("loadFailureCount", stats.loadFailureCount());
        result.put("totalLoadTime", stats.totalLoadTime());
        result.put("averageLoadPenalty", stats.averageLoadPenalty());
        result.put("evictionCount", stats.evictionCount());
        result.put("evictionWeight", stats.evictionWeight());
        result.put("estimatedSize", nativeCache.estimatedSize());

        return ResponseEntity.ok(CommonResponse.success(result));
    }

    /**
     * 캐시 목록 조회
     */
    @GetMapping("/list")
    @Operation(summary = "캐시 목록 조회", description = "모든 캐시 이름 목록을 조회합니다")
    public ResponseEntity<CommonResponse<Map<String, Object>>> listCaches() {
        log.info("📋 캐시 목록 조회 요청");
        
        var cacheNames = cacheManager.getCacheNames()
                .stream()
                .sorted()
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("count", cacheNames.size());
        result.put("caches", cacheNames);

        return ResponseEntity.ok(CommonResponse.success(result));
    }

    /**
     * 모든 캐시 초기화
     */
    @DeleteMapping("/clear")
    @Operation(summary = "모든 캐시 초기화", description = "모든 캐시를 비웁니다")
    public ResponseEntity<CommonResponse<Map<String, Object>>> clearAllCaches() {
        log.warn("⚠️ 모든 캐시 초기화 요청");
        
        int clearedCount = 0;
        for (String cacheName : cacheManager.getCacheNames()) {
            var cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                clearedCount++;
                log.info("✅ 캐시 '{}' 초기화 완료", cacheName);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("clearedCacheCount", clearedCount);
        result.put("message", clearedCount + "개의 캐시가 초기화되었습니다");

        return ResponseEntity.ok(CommonResponse.success(result));
    }

    /**
     * 특정 캐시 초기화
     */
    @DeleteMapping("/clear/{cacheName}")
    @Operation(summary = "특정 캐시 초기화", description = "지정된 캐시를 비웁니다")
    public ResponseEntity<CommonResponse<Map<String, Object>>> clearCache(
            @PathVariable String cacheName) {
        log.warn("⚠️ 캐시 '{}' 초기화 요청", cacheName);
        
        var cache = cacheManager.getCache(cacheName);
        if (cache == null) {
            return ResponseEntity.notFound().build();
        }

        cache.clear();
        log.info("✅ 캐시 '{}' 초기화 완료", cacheName);

        Map<String, Object> result = new HashMap<>();
        result.put("cacheName", cacheName);
        result.put("message", "캐시가 초기화되었습니다");

        return ResponseEntity.ok(CommonResponse.success(result));
    }

    /**
     * 특정 캐시 키 삭제
     */
    @DeleteMapping("/{cacheName}/{key}")
    @Operation(summary = "캐시 키 삭제", description = "지정된 캐시의 특정 키를 삭제합니다")
    public ResponseEntity<CommonResponse<Map<String, Object>>> evictCacheKey(
            @PathVariable String cacheName,
            @PathVariable String key) {
        log.info("🗑️ 캐시 '{}' 키 '{}' 삭제 요청", cacheName, key);
        
        var cache = cacheManager.getCache(cacheName);
        if (cache == null) {
            return ResponseEntity.notFound().build();
        }

        cache.evict(key);
        log.info("✅ 캐시 키 삭제 완료");

        Map<String, Object> result = new HashMap<>();
        result.put("cacheName", cacheName);
        result.put("key", key);
        result.put("message", "캐시 키가 삭제되었습니다");

        return ResponseEntity.ok(CommonResponse.success(result));
    }
}
