package com.campstation.camp.pricing.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campstation.camp.pricing.domain.PricingRuleType;
import com.campstation.camp.pricing.domain.SitePricing;

/**
 * 사이트 요금제 Repository
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface SitePricingRepository extends JpaRepository<SitePricing, Long> {

    /**
     * 사이트의 모든 활성화된 요금제 조회 (우선순위 내림차순)
     * 
     * @param siteId 사이트 ID
     * @return 요금제 목록 (우선순위 높은 순)
     */
    List<SitePricing> findBySiteIdAndIsActiveTrueOrderByPriorityDesc(Long siteId);

    /**
     * 사이트의 모든 요금제 조회 (활성/비활성 포함, 우선순위 내림차순)
     * 
     * @param siteId 사이트 ID
     * @return 요금제 목록
     */
    List<SitePricing> findBySiteIdOrderByPriorityDesc(Long siteId);

    /**
     * 사이트의 기본 요금제 조회
     * 
     * @param siteId 사이트 ID
     * @return 기본 요금제
     */
    Optional<SitePricing> findBySiteIdAndRuleType(Long siteId, PricingRuleType ruleType);

    /**
     * 특정 날짜에 적용 가능한 요금제 조회
     * 월-일 기반 비교는 복잡하므로 모든 활성 요금제를 가져온 후 Java 코드에서 isApplicableOn()으로 필터링
     * 
     * @param siteId 사이트 ID
     * @return 활성화된 요금제 목록 (우선순위 높은 순)
     * @deprecated Use findBySiteIdAndIsActiveTrueOrderByPriorityDesc and filter with isApplicableOn() in code
     */
    @Deprecated
    default List<SitePricing> findApplicablePricings(Long siteId, LocalDate date) {
        return findBySiteIdAndIsActiveTrueOrderByPriorityDesc(siteId).stream()
            .filter(pricing -> pricing.isApplicableOn(date))
            .toList();
    }

    /**
     * 캠핑장의 모든 사이트 요금제 조회
     * 
     * @param campgroundId 캠핑장 ID
     * @return 요금제 목록
     */
    @Query("SELECT sp FROM SitePricing sp WHERE sp.site.campground.id = :campgroundId " +
           "ORDER BY sp.site.id, sp.priority DESC")
    List<SitePricing> findByCampgroundId(@Param("campgroundId") Long campgroundId);

    /**
     * 특정 기간과 겹치는 요금제 조회
     * 월-일 기반 비교는 복잡하므로 모든 요금제를 가져온 후 Java 코드에서 기간별로 필터링
     * 
     * @param siteId 사이트 ID
     * @param startDate 시작일
     * @param endDate 종료일
     * @return 겹치는 요금제 목록
     * @deprecated Use findBySiteIdOrderByPriorityDesc and filter with isApplicableOn() in code
     */
    @Deprecated
    default List<SitePricing> findOverlappingPricings(Long siteId, LocalDate startDate, LocalDate endDate) {
        List<SitePricing> allPricings = findBySiteIdOrderByPriorityDesc(siteId);
        return allPricings.stream()
            .filter(pricing -> {
                // 시작일부터 종료일까지 하루라도 겹치는지 확인
                LocalDate current = startDate;
                while (!current.isAfter(endDate)) {
                    if (pricing.isApplicableOn(current)) {
                        return true;
                    }
                    current = current.plusDays(1);
                }
                return false;
            })
            .toList();
    }

    /**
     * 요금제 이름으로 검색
     * 
     * @param siteId 사이트 ID
     * @param pricingName 요금제 이름
     * @return 요금제
     */
    Optional<SitePricing> findBySiteIdAndPricingName(Long siteId, String pricingName);

    /**
     * 사이트의 활성화된 요금제 개수 조회
     * 
     * @param siteId 사이트 ID
     * @return 활성화된 요금제 개수
     */
    Long countBySiteIdAndIsActiveTrue(Long siteId);

    /**
     * Owner의 캠핑장에 속한 모든 요금제 조회
     * 
     * @param ownerId Owner ID
     * @return 요금제 목록
     */
    @Query("SELECT sp FROM SitePricing sp " +
           "WHERE sp.site.campground.owner.id = :ownerId " +
           "ORDER BY sp.site.campground.id, sp.site.id, sp.priority DESC")
    List<SitePricing> findByOwnerId(@Param("ownerId") Long ownerId);
}
