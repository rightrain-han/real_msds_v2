-- MSDS 테이블에서 배열 컬럼들을 제거하고 기본 정보만 유지
ALTER TABLE msds_items 
DROP COLUMN IF EXISTS hazards,
DROP COLUMN IF EXISTS reception,
DROP COLUMN IF EXISTS laws,
DROP COLUMN IF EXISTS warning_symbols;

-- 필요한 컬럼만 유지
-- id, name, pdf_file_name, pdf_file_url, usage, qr_code, created_at, updated_at
