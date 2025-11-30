-- =====================================================
-- CampStation Database Schema
-- PostgreSQL Migration Script
-- Version: 1.0
-- Date: 2025-10-31
-- =====================================================

-- =====================================================
-- 1. USERS TABLE (사용자 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP,
    provider VARCHAR(20),
    provider_id VARCHAR(100),
    profile_image VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Table comment (테이블 주석)
COMMENT ON TABLE users IS '사용자 정보 / User information';

-- Column comments (컬럼 주석)
COMMENT ON COLUMN users.id IS '사용자 고유 ID / User unique ID';
COMMENT ON COLUMN users.username IS '사용자명 (로그인용) / Username for login';
COMMENT ON COLUMN users.email IS '이메일 주소 / Email address';
COMMENT ON COLUMN users.password IS '암호화된 비밀번호 / Encrypted password';
COMMENT ON COLUMN users.name IS '실명 / Real name';
COMMENT ON COLUMN users.phone IS '전화번호 / Phone number';
COMMENT ON COLUMN users.role IS '사용자 역할 (USER, OWNER, ADMIN) / User role';
COMMENT ON COLUMN users.status IS '계정 상태 (ACTIVE, INACTIVE, LOCKED) / Account status';
COMMENT ON COLUMN users.last_login_at IS '마지막 로그인 일시 / Last login timestamp';
COMMENT ON COLUMN users.provider IS 'OAuth 제공자 (google, kakao, naver) / OAuth provider';
COMMENT ON COLUMN users.provider_id IS 'OAuth 제공자 ID / OAuth provider ID';
COMMENT ON COLUMN users.profile_image IS '프로필 이미지 URL / Profile image URL';
COMMENT ON COLUMN users.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN users.updated_at IS '수정 일시 / Updated timestamp';
COMMENT ON COLUMN users.deleted_at IS '삭제 일시 (Soft Delete) / Deleted timestamp';

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- =====================================================
-- 2. GUESTS TABLE (비회원 게스트 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS guests (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table comment
COMMENT ON TABLE guests IS '비회원 예약 정보 / Guest (non-member) reservation information';

-- Column comments
COMMENT ON COLUMN guests.id IS '게스트 고유 ID / Guest unique ID';
COMMENT ON COLUMN guests.name IS '게스트 이름 / Guest name';
COMMENT ON COLUMN guests.phone IS '게스트 전화번호 / Guest phone number';
COMMENT ON COLUMN guests.email IS '게스트 이메일 / Guest email';
COMMENT ON COLUMN guests.password IS '예약 조회용 비밀번호 / Password for reservation lookup';
COMMENT ON COLUMN guests.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN guests.updated_at IS '수정 일시 / Updated timestamp';

-- Indexes for guests table
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_phone ON guests(phone);

-- =====================================================
-- 3. CAMPGROUNDS TABLE (캠핑장 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS campgrounds (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    owner_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_campgrounds_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table comment
COMMENT ON TABLE campgrounds IS '캠핑장 정보 / Campground information';

-- Column comments
COMMENT ON COLUMN campgrounds.id IS '캠핑장 고유 ID / Campground unique ID';
COMMENT ON COLUMN campgrounds.name IS '캠핑장 이름 / Campground name';
COMMENT ON COLUMN campgrounds.description IS '캠핑장 설명 / Campground description';
COMMENT ON COLUMN campgrounds.address IS '캠핑장 주소 / Campground address';
COMMENT ON COLUMN campgrounds.phone IS '전화번호 / Phone number';
COMMENT ON COLUMN campgrounds.email IS '이메일 / Email';
COMMENT ON COLUMN campgrounds.website IS '웹사이트 URL / Website URL';
COMMENT ON COLUMN campgrounds.latitude IS '위도 / Latitude';
COMMENT ON COLUMN campgrounds.longitude IS '경도 / Longitude';
COMMENT ON COLUMN campgrounds.status IS '운영 상태 (ACTIVE, INACTIVE, CLOSED) / Operation status';
COMMENT ON COLUMN campgrounds.owner_id IS '소유자 ID / Owner user ID';
COMMENT ON COLUMN campgrounds.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN campgrounds.updated_at IS '수정 일시 / Updated timestamp';
COMMENT ON COLUMN campgrounds.deleted_at IS '삭제 일시 (Soft Delete) / Deleted timestamp';

-- Indexes for campgrounds table
CREATE INDEX idx_campgrounds_owner_id ON campgrounds(owner_id);
CREATE INDEX idx_campgrounds_status ON campgrounds(status);
CREATE INDEX idx_campgrounds_deleted_at ON campgrounds(deleted_at);
CREATE INDEX idx_campgrounds_location ON campgrounds(latitude, longitude);

-- =====================================================
-- 4. CAMPGROUND_IMAGES TABLE (캠핑장 이미지 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS campground_images (
    id BIGSERIAL PRIMARY KEY,
    campground_id BIGINT NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    original_url VARCHAR(500) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_main BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_campground_images_campground FOREIGN KEY (campground_id) REFERENCES campgrounds(id) ON DELETE CASCADE
);

-- Table comment
COMMENT ON TABLE campground_images IS '캠핑장 이미지 / Campground images';

-- Column comments
COMMENT ON COLUMN campground_images.id IS '이미지 고유 ID / Image unique ID';
COMMENT ON COLUMN campground_images.campground_id IS '캠핑장 ID / Campground ID';
COMMENT ON COLUMN campground_images.thumbnail_url IS '썸네일 이미지 URL / Thumbnail image URL';
COMMENT ON COLUMN campground_images.original_url IS '원본 이미지 URL / Original image URL';
COMMENT ON COLUMN campground_images.display_order IS '표시 순서 / Display order';
COMMENT ON COLUMN campground_images.is_main IS '메인 이미지 여부 / Is main image flag';
COMMENT ON COLUMN campground_images.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN campground_images.updated_at IS '수정 일시 / Updated timestamp';

-- Indexes for campground_images table
CREATE INDEX idx_campground_images_campground_id ON campground_images(campground_id);
CREATE INDEX idx_campground_images_display_order ON campground_images(campground_id, display_order);
CREATE INDEX idx_campground_images_is_main ON campground_images(campground_id, is_main);

-- =====================================================
-- 5. SITES TABLE (캠핑 사이트 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS sites (
    id BIGSERIAL PRIMARY KEY,
    site_number VARCHAR(20) NOT NULL,
    site_type VARCHAR(20) NOT NULL,
    capacity INTEGER NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    campground_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_sites_campground FOREIGN KEY (campground_id) REFERENCES campgrounds(id) ON DELETE CASCADE
);

-- Table comment
COMMENT ON TABLE sites IS '캠핑 사이트 정보 / Camping site information';

-- Column comments
COMMENT ON COLUMN sites.id IS '사이트 고유 ID / Site unique ID';
COMMENT ON COLUMN sites.site_number IS '사이트 번호 / Site number';
COMMENT ON COLUMN sites.site_type IS '사이트 유형 (TENT, RV, CABIN 등) / Site type';
COMMENT ON COLUMN sites.capacity IS '수용 인원 / Capacity';
COMMENT ON COLUMN sites.price_per_night IS '1박 가격 / Price per night';
COMMENT ON COLUMN sites.description IS '사이트 설명 / Site description';
COMMENT ON COLUMN sites.latitude IS '위도 / Latitude';
COMMENT ON COLUMN sites.longitude IS '경도 / Longitude';
COMMENT ON COLUMN sites.status IS '사이트 상태 (AVAILABLE, OCCUPIED, MAINTENANCE) / Site status';
COMMENT ON COLUMN sites.campground_id IS '캠핑장 ID / Campground ID';
COMMENT ON COLUMN sites.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN sites.updated_at IS '수정 일시 / Updated timestamp';
COMMENT ON COLUMN sites.deleted_at IS '삭제 일시 (Soft Delete) / Deleted timestamp';

-- Indexes for sites table
CREATE INDEX idx_sites_campground_id ON sites(campground_id);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_site_type ON sites(site_type);
CREATE INDEX idx_sites_deleted_at ON sites(deleted_at);

-- =====================================================
-- 6. SITE_AMENITIES TABLE (사이트 편의시설 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS site_amenities (
    id BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL,
    amenity_type VARCHAR(50) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_site_amenities_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

-- Table comment
COMMENT ON TABLE site_amenities IS '사이트 편의시설 정보 / Site amenities information';

-- Column comments
COMMENT ON COLUMN site_amenities.id IS '편의시설 고유 ID / Amenity unique ID';
COMMENT ON COLUMN site_amenities.site_id IS '사이트 ID / Site ID';
COMMENT ON COLUMN site_amenities.amenity_type IS '편의시설 유형 (ELECTRICITY, WATER, WIFI 등) / Amenity type';
COMMENT ON COLUMN site_amenities.available IS '이용 가능 여부 / Availability flag';
COMMENT ON COLUMN site_amenities.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN site_amenities.updated_at IS '수정 일시 / Updated timestamp';
COMMENT ON COLUMN site_amenities.deleted_at IS '삭제 일시 (Soft Delete) / Deleted timestamp';

-- Indexes for site_amenities table
CREATE INDEX idx_site_amenities_site_id ON site_amenities(site_id);
CREATE INDEX idx_site_amenities_type ON site_amenities(amenity_type);

-- =====================================================
-- 7. RESERVATIONS TABLE (예약 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    campground_id BIGINT NOT NULL,
    site_id BIGINT NOT NULL,
    guest_id BIGINT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    special_requests TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_reservations_campground FOREIGN KEY (campground_id) REFERENCES campgrounds(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservations_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservations_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL
);

-- Table comment
COMMENT ON TABLE reservations IS '예약 정보 / Reservation information';

-- Column comments
COMMENT ON COLUMN reservations.id IS '예약 고유 ID / Reservation unique ID';
COMMENT ON COLUMN reservations.user_id IS '회원 사용자 ID / Member user ID';
COMMENT ON COLUMN reservations.campground_id IS '캠핑장 ID / Campground ID';
COMMENT ON COLUMN reservations.site_id IS '사이트 ID / Site ID';
COMMENT ON COLUMN reservations.guest_id IS '비회원 게스트 ID / Guest (non-member) ID';
COMMENT ON COLUMN reservations.check_in_date IS '체크인 날짜 / Check-in date';
COMMENT ON COLUMN reservations.check_out_date IS '체크아웃 날짜 / Check-out date';
COMMENT ON COLUMN reservations.number_of_guests IS '인원 수 / Number of guests';
COMMENT ON COLUMN reservations.total_amount IS '총 금액 / Total amount';
COMMENT ON COLUMN reservations.status IS '예약 상태 (PENDING, CONFIRMED, CANCELLED, COMPLETED) / Reservation status';
COMMENT ON COLUMN reservations.special_requests IS '특별 요청사항 / Special requests';
COMMENT ON COLUMN reservations.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN reservations.updated_at IS '수정 일시 / Updated timestamp';
COMMENT ON COLUMN reservations.deleted_at IS '삭제 일시 (Soft Delete) / Deleted timestamp';

-- Indexes for reservations table
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_campground_id ON reservations(campground_id);
CREATE INDEX idx_reservations_site_id ON reservations(site_id);
CREATE INDEX idx_reservations_guest_id ON reservations(guest_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX idx_reservations_deleted_at ON reservations(deleted_at);

-- =====================================================
-- 8. PAYMENTS TABLE (결제 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reservation_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(100),
    card_number VARCHAR(500),
    card_holder_name VARCHAR(50),
    depositor_name VARCHAR(100),
    failure_reason VARCHAR(1000),
    toss_method VARCHAR(50),
    easy_pay_provider VARCHAR(50),
    card_company VARCHAR(100),
    card_type VARCHAR(20),
    acquirer_code VARCHAR(50),
    installment_plan_months VARCHAR(10),
    approve_no VARCHAR(100),
    approved_at VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Table comment
COMMENT ON TABLE payments IS '결제 정보 / Payment information';

-- Column comments
COMMENT ON COLUMN payments.id IS '결제 고유 ID / Payment unique ID';
COMMENT ON COLUMN payments.user_id IS '사용자 ID / User ID';
COMMENT ON COLUMN payments.reservation_id IS '예약 ID / Reservation ID';
COMMENT ON COLUMN payments.amount IS '결제 금액 / Payment amount';
COMMENT ON COLUMN payments.payment_method IS '결제 수단 (CARD, BANK_TRANSFER, TOSS 등) / Payment method';
COMMENT ON COLUMN payments.status IS '결제 상태 (PENDING, COMPLETED, FAILED, CANCELLED) / Payment status';
COMMENT ON COLUMN payments.transaction_id IS '거래 ID / Transaction ID';
COMMENT ON COLUMN payments.card_number IS '마스킹된 카드 번호 / Masked card number';
COMMENT ON COLUMN payments.card_holder_name IS '카드 소유자명 / Card holder name';
COMMENT ON COLUMN payments.depositor_name IS '입금자명 (무통장 입금) / Depositor name';
COMMENT ON COLUMN payments.failure_reason IS '실패 사유 / Failure reason';
COMMENT ON COLUMN payments.toss_method IS '토스페이먼츠 결제 방법 / Toss Payments method';
COMMENT ON COLUMN payments.easy_pay_provider IS '간편결제 제공자 / Easy pay provider';
COMMENT ON COLUMN payments.card_company IS '카드사 / Card company';
COMMENT ON COLUMN payments.card_type IS '카드 종류 (신용, 체크) / Card type';
COMMENT ON COLUMN payments.acquirer_code IS '매입사 코드 / Acquirer code';
COMMENT ON COLUMN payments.installment_plan_months IS '할부 개월 수 / Installment plan months';
COMMENT ON COLUMN payments.approve_no IS '승인 번호 / Approval number';
COMMENT ON COLUMN payments.approved_at IS '승인 일시 / Approved timestamp';
COMMENT ON COLUMN payments.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN payments.updated_at IS '수정 일시 / Updated timestamp';
COMMENT ON COLUMN payments.deleted_at IS '삭제 일시 (Soft Delete) / Deleted timestamp';

-- Indexes for payments table
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- =====================================================
-- 9. REFUNDS TABLE (환불 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS refunds (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    reservation_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    refund_amount DECIMAL(10, 2) NOT NULL,
    refund_reason VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL,
    refund_transaction_id VARCHAR(100),
    refunded_at TIMESTAMP,
    failure_reason VARCHAR(1000),
    processed_by BIGINT NOT NULL,
    refund_type VARCHAR(20) NOT NULL,
    cancel_status VARCHAR(50),
    cancel_request_id VARCHAR(100),
    tax_free_amount DECIMAL(10, 2),
    tax_exemption_amount DECIMAL(10, 2),
    refundable_amount DECIMAL(10, 2),
    card_discount_amount DECIMAL(10, 2),
    transfer_discount_amount DECIMAL(10, 2),
    easy_pay_discount_amount DECIMAL(10, 2),
    receipt_key VARCHAR(100),
    total_amount DECIMAL(10, 2),
    balance_amount DECIMAL(10, 2),
    payment_status VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    CONSTRAINT fk_refunds_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    CONSTRAINT fk_refunds_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_refunds_processed_by FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Table comment
COMMENT ON TABLE refunds IS '환불 정보 / Refund information';

-- Column comments
COMMENT ON COLUMN refunds.id IS '환불 고유 ID / Refund unique ID';
COMMENT ON COLUMN refunds.payment_id IS '결제 ID / Payment ID';
COMMENT ON COLUMN refunds.reservation_id IS '예약 ID / Reservation ID';
COMMENT ON COLUMN refunds.user_id IS '사용자 ID / User ID';
COMMENT ON COLUMN refunds.refund_amount IS '환불 금액 / Refund amount';
COMMENT ON COLUMN refunds.refund_reason IS '환불 사유 / Refund reason';
COMMENT ON COLUMN refunds.status IS '환불 상태 (PENDING, COMPLETED, FAILED) / Refund status';
COMMENT ON COLUMN refunds.refund_transaction_id IS '환불 거래 ID / Refund transaction ID';
COMMENT ON COLUMN refunds.refunded_at IS '환불 완료 일시 / Refunded timestamp';
COMMENT ON COLUMN refunds.failure_reason IS '실패 사유 / Failure reason';
COMMENT ON COLUMN refunds.processed_by IS '환불 처리자 ID / Processed by user ID';
COMMENT ON COLUMN refunds.refund_type IS '환불 유형 (USER, OWNER) / Refund type';
COMMENT ON COLUMN refunds.cancel_status IS '취소 상태 / Cancel status';
COMMENT ON COLUMN refunds.cancel_request_id IS '취소 요청 ID / Cancel request ID';
COMMENT ON COLUMN refunds.tax_free_amount IS '면세 금액 / Tax-free amount';
COMMENT ON COLUMN refunds.tax_exemption_amount IS '과세 제외 금액 / Tax exemption amount';
COMMENT ON COLUMN refunds.refundable_amount IS '환불 가능 금액 / Refundable amount';
COMMENT ON COLUMN refunds.card_discount_amount IS '카드 할인 금액 / Card discount amount';
COMMENT ON COLUMN refunds.transfer_discount_amount IS '계좌이체 할인 금액 / Transfer discount amount';
COMMENT ON COLUMN refunds.easy_pay_discount_amount IS '간편결제 할인 금액 / Easy pay discount amount';
COMMENT ON COLUMN refunds.receipt_key IS '영수증 키 / Receipt key';
COMMENT ON COLUMN refunds.total_amount IS '원래 결제 총액 / Original total amount';
COMMENT ON COLUMN refunds.balance_amount IS '환불 후 잔액 / Balance amount after refund';
COMMENT ON COLUMN refunds.payment_status IS '결제 상태 (PARTIAL_CANCELED, CANCELED) / Payment status';
COMMENT ON COLUMN refunds.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN refunds.updated_at IS '수정 일시 / Updated timestamp';
COMMENT ON COLUMN refunds.deleted_at IS '삭제 일시 (Soft Delete) / Deleted timestamp';

-- Indexes for refunds table
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_reservation_id ON refunds(reservation_id);
CREATE INDEX idx_refunds_user_id ON refunds(user_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_processed_by ON refunds(processed_by);

-- =====================================================
-- 10. REVIEWS TABLE (리뷰 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    campground_id BIGINT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    images JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_campground FOREIGN KEY (campground_id) REFERENCES campgrounds(id) ON DELETE CASCADE,
    CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5)
);

-- Table comment
COMMENT ON TABLE reviews IS '리뷰 정보 / Review information';

-- Column comments
COMMENT ON COLUMN reviews.id IS '리뷰 고유 ID / Review unique ID';
COMMENT ON COLUMN reviews.user_id IS '사용자 ID / User ID';
COMMENT ON COLUMN reviews.campground_id IS '캠핑장 ID / Campground ID';
COMMENT ON COLUMN reviews.rating IS '평점 (1-5) / Rating (1-5)';
COMMENT ON COLUMN reviews.comment IS '리뷰 내용 / Review comment';
COMMENT ON COLUMN reviews.images IS '이미지 URL들 (JSON) / Image URLs (JSON)';
COMMENT ON COLUMN reviews.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN reviews.updated_at IS '수정 일시 / Updated timestamp';
COMMENT ON COLUMN reviews.deleted_at IS '삭제 일시 (Soft Delete) / Deleted timestamp';

-- Indexes for reviews table
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_campground_id ON reviews(campground_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_deleted_at ON reviews(deleted_at);

-- =====================================================
-- 11. FAVORITES TABLE (찜하기 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    campground_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_campground FOREIGN KEY (campground_id) REFERENCES campgrounds(id) ON DELETE CASCADE,
    CONSTRAINT uk_favorites_user_campground UNIQUE (user_id, campground_id)
);

-- Table comment
COMMENT ON TABLE favorites IS '찜하기 정보 / Favorite information';

-- Column comments
COMMENT ON COLUMN favorites.id IS '찜하기 고유 ID / Favorite unique ID';
COMMENT ON COLUMN favorites.user_id IS '사용자 ID / User ID';
COMMENT ON COLUMN favorites.campground_id IS '캠핑장 ID / Campground ID';
COMMENT ON COLUMN favorites.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN favorites.updated_at IS '수정 일시 / Updated timestamp';
COMMENT ON COLUMN favorites.deleted_at IS '삭제 일시 (Soft Delete) / Deleted timestamp';

-- Indexes for favorites table
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_campground_id ON favorites(campground_id);

-- =====================================================
-- Database Initialization Complete
-- =====================================================
