package com.campstation.camp.shared.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.banner.domain.Banner;
import com.campstation.camp.banner.domain.BannerStatus;
import com.campstation.camp.banner.domain.BannerType;
import com.campstation.camp.banner.repository.BannerRepository;
import com.campstation.camp.campground.domain.AmenityType;
import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.domain.CampgroundCertification;
import com.campstation.camp.campground.domain.CampgroundImage;
import com.campstation.camp.campground.domain.CampgroundOperationType;
import com.campstation.camp.campground.domain.CampgroundStatus;
import com.campstation.camp.campground.domain.Site;
import com.campstation.camp.campground.domain.SiteImage;
import com.campstation.camp.campground.domain.SiteStatus;
import com.campstation.camp.campground.domain.SiteType;
import com.campstation.camp.campground.repository.CampgroundRepository;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.domain.UserRole;
import com.campstation.camp.user.domain.UserStatus;
import com.campstation.camp.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
@Profile("!prod") // 프로덕션이 아닌 환경(dev, test 등)에서만 실행
public class DataInitializer {

    private final UserRepository userRepository;
    private final CampgroundRepository campgroundRepository;
    private final BannerRepository bannerRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return new CommandLineRunner() {
            @Override
            @Transactional
            public void run(String... args) throws Exception {
                // 1. Users Initialization
                if (userRepository.count() == 0) {
                    log.info("Initializing Users...");
                    createUsers();
                }

                // 2. Campgrounds Initialization
                if (campgroundRepository.count() == 0) {
                    log.info("Initializing Campgrounds...");
                    createCampgrounds();
                }

                // 3. Banners Initialization
                if (bannerRepository.count() == 0) {
                    log.info("Initializing Banners...");
                    createBanners();
                }
            }
        };
    }

    private void createUsers() {
        // Admin
        User admin = User.builder()
                .email("admin@campstation.com")
                .password(passwordEncoder.encode("password"))
                .name("관리자")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .username("admin")
                .phone("010-0000-0000")
                .build();
        userRepository.save(admin);

        // Owner
        User owner = User.builder()
                .email("owner@campstation.com")
                .password(passwordEncoder.encode("password"))
                .name("김사장")
                .role(UserRole.OWNER)
                .status(UserStatus.ACTIVE)
                .username("owner")
                .phone("010-1111-2222")
                .build();
        userRepository.save(owner);

        // Member
        User member = User.builder()
                .email("user@campstation.com")
                .password(passwordEncoder.encode("password"))
                .name("이캠퍼")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .username("camper")
                .phone("010-3333-4444")
                .build();
        userRepository.save(member);
    }

    private void createCampgrounds() {
        User owner = userRepository.findByEmail("owner@campstation.com").orElseThrow();

        // 1. Seoul Camping (Auto Camping)
        Campground seoulCamp = Campground.builder()
                .name("서울 숲 캠핑장")
                .description("서울 도심 속에서 즐기는 힐링 캠핑. 편안한 휴식과 함께 자연을 느껴보세요.")
                .address("서울특별시 성동구 뚝섬로 273")
                .phone("02-123-4567")
                .email("seoul@campstation.com")
                .latitude(new BigDecimal("37.5443"))
                .longitude(new BigDecimal("127.0374"))
                .status(CampgroundStatus.ACTIVE)
                .operationType(CampgroundOperationType.MUNICIPAL)
                .certification(CampgroundCertification.REGISTERED)
                .checkInTime(LocalTime.of(14, 0))
                .checkOutTime(LocalTime.of(11, 0))
                .owner(owner)
                .build();

        // Images
        seoulCamp.addImage(createCampgroundImage(seoulCamp,
                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4", true, 1));
        seoulCamp.addImage(createCampgroundImage(seoulCamp,
                "https://images.unsplash.com/photo-1537905569824-f89f14cceb68", false, 2));

        // Sites
        Site siteA = createSite(seoulCamp, "A-1", SiteType.AUTO_CAMPING, 4, "넓은 데크 사이트", 100);
        Site siteB = createSite(seoulCamp, "B-1", SiteType.AUTO_CAMPING, 4, "파쇄석 사이트", 100);

        seoulCamp.addSite(siteA);
        seoulCamp.addSite(siteB);

        campgroundRepository.save(seoulCamp);

        // 2. Jeju Ocean View (Glamping)
        Campground jejuCamp = Campground.builder()
                .name("제주 오션뷰 글램핑")
                .description("제주의 푸른 바다가 한눈에 보이는 럭셔리 글램핑장입니다. 호텔급 시설을 자랑합니다.")
                .address("제주특별자치도 제주시 애월읍 애월해안로")
                .phone("064-123-4567")
                .email("jeju@campstation.com")
                .latitude(new BigDecimal("33.4655"))
                .longitude(new BigDecimal("126.3183"))
                .status(CampgroundStatus.ACTIVE)
                .operationType(CampgroundOperationType.PRIVATE)
                .certification(CampgroundCertification.TOURISM)
                .checkInTime(LocalTime.of(15, 0))
                .checkOutTime(LocalTime.of(11, 0))
                .owner(owner)
                .build();

        jejuCamp.addImage(createCampgroundImage(jejuCamp,
                "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7", true, 1));
        jejuCamp.addImage(createCampgroundImage(jejuCamp,
                "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d", false, 2));

        Site glamping1 = createSite(jejuCamp, "G-101", SiteType.GLAMPING, 2, "오션뷰 커플 글램핑", 150);
        Site glamping2 = createSite(jejuCamp, "G-102", SiteType.GLAMPING, 4, "패밀리 글램핑", 200);

        jejuCamp.addSite(glamping1);
        jejuCamp.addSite(glamping2);

        campgroundRepository.save(jejuCamp);
    }

    private Site createSite(Campground campground, String number, SiteType type, int capacity, String desc, int price) {
        Site site = Site.builder()
                .siteNumber(number)
                .siteType(type)
                .capacity(capacity)
                .description(desc)
                .status(SiteStatus.AVAILABLE)
                .campground(campground)
                .build();

        // Add Amenities (Bitmask logic needs AmenityType enum, assuming some values)
        // site.addAmenity(AmenityType.ELECTRICITY); // Example

        // Add Site Images
        SiteImage image = SiteImage.builder()
                .imageUrl("https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7")
                .thumbnailUrl("https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7")
                .displayOrder(1)
                .build();
        site.addImage(image);

        return site;
    }

    private CampgroundImage createCampgroundImage(Campground campground, String url, boolean isMain, int order) {
        return CampgroundImage.builder()
                .imageUrl(url)
                .thumbnailUrl(url)
                .isMain(isMain)
                .displayOrder(order)
                .build();
    }

    private void createBanners() {
        Banner banner1 = Banner.builder()
                .title("여름 맞이 특가 이벤트")
                .description("올 여름, 시원한 계곡 캠핑장으로 떠나보세요!")
                .type(BannerType.PROMOTION)
                .status(BannerStatus.ACTIVE)
                .imageUrl("https://images.unsplash.com/photo-1504280390367-361c6d9f38f4")
                .thumbnailUrl("https://images.unsplash.com/photo-1504280390367-361c6d9f38f4")
                .linkUrl("/campgrounds/popular")
                .displayOrder(1)
                .startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusMonths(1))
                .build();
        bannerRepository.save(banner1);

        Banner banner2 = Banner.builder()
                .title("신규 오픈! 제주 오션뷰")
                .description("제주도의 푸른 밤을 선물합니다.")
                .type(BannerType.PROMOTION)
                .status(BannerStatus.ACTIVE)
                .imageUrl("https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7")
                .thumbnailUrl("https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7")
                .linkUrl("/campgrounds/search?keyword=제주")
                .displayOrder(2)
                .startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusMonths(1))
                .build();
        bannerRepository.save(banner2);
    }
}
