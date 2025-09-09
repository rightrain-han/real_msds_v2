-- ========================================
-- MSDS 코드 필드 추가 (M0001, M0002...)
-- ========================================

-- 1. msds_items 테이블에 msds_code 필드 추가
ALTER TABLE msds_items 
ADD COLUMN IF NOT EXISTS msds_code VARCHAR(10) UNIQUE;

-- 2. 기존 데이터에 MSDS 코드 생성 및 업데이트
-- 기존 ID를 기반으로 M0001, M0002... 형태로 생성
UPDATE msds_items 
SET msds_code = 'M' || LPAD(id::text, 4, '0')
WHERE msds_code IS NULL;

-- 3. msds_code 필드를 NOT NULL로 설정
ALTER TABLE msds_items 
ALTER COLUMN msds_code SET NOT NULL;

-- 4. 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_msds_items_code ON msds_items(msds_code);

-- 5. 기존 관계 테이블들도 msds_code로 참조할 수 있도록 확장
-- (선택사항 - 기존 id 참조도 유지)

-- 6. MSDS 코드 생성 함수 생성
CREATE OR REPLACE FUNCTION generate_msds_code()
RETURNS VARCHAR(10) AS $$
DECLARE
    next_id INTEGER;
    new_code VARCHAR(10);
BEGIN
    -- 다음 ID 번호 계산
    SELECT COALESCE(MAX(CAST(SUBSTRING(msds_code FROM 2) AS INTEGER)), 0) + 1
    INTO next_id
    FROM msds_items
    WHERE msds_code ~ '^M[0-9]+$';
    
    -- M0001 형태로 포맷팅
    new_code := 'M' || LPAD(next_id::text, 4, '0');
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 7. 새로운 MSDS 추가 시 자동으로 코드 생성하는 트리거 함수
CREATE OR REPLACE FUNCTION set_msds_code()
RETURNS TRIGGER AS $$
BEGIN
    -- msds_code가 없으면 자동 생성
    IF NEW.msds_code IS NULL THEN
        NEW.msds_code := generate_msds_code();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 트리거 생성
DROP TRIGGER IF EXISTS trigger_set_msds_code ON msds_items;
CREATE TRIGGER trigger_set_msds_code
    BEFORE INSERT ON msds_items
    FOR EACH ROW
    EXECUTE FUNCTION set_msds_code();

-- 9. 현재 데이터 확인
SELECT id, msds_code, name, usage 
FROM msds_items 
ORDER BY id 
LIMIT 10;
