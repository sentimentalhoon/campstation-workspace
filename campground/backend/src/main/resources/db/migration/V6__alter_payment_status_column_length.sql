-- 결제 상태(status) 컬럼 길이 확장
-- CONFIRMATION_REQUESTED 상태 추가를 위해 varchar(20) -> varchar(30)으로 변경

ALTER TABLE payments ALTER COLUMN status TYPE varchar(30);
