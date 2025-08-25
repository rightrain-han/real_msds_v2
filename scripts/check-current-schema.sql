-- 1. 현재 테이블 목록 확인
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%msds%' OR table_name LIKE '%warning%' OR table_name LIKE '%protective%' OR table_name LIKE '%config%'
ORDER BY table_name;

-- 2. msds_items 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'msds_items' 
ORDER BY ordinal_position;

-- 3. 기존 데이터 개수 확인
SELECT 
  (SELECT COUNT(*) FROM msds_items) as msds_count,
  (SELECT COUNT(*) FROM warning_symbols) as symbols_count,
  (SELECT COUNT(*) FROM protective_equipment) as equipment_count,
  (SELECT COUNT(*) FROM config_options) as config_count;

-- 4. 기존 msds_items 데이터 샘플 확인 (배열 컬럼 포함)
SELECT id, name, 
       COALESCE(array_length(hazards, 1), 0) as hazards_count,
       COALESCE(array_length(reception, 1), 0) as reception_count,
       COALESCE(array_length(laws, 1), 0) as laws_count,
       COALESCE(array_length(warning_symbols, 1), 0) as warning_symbols_count
FROM msds_items 
ORDER BY id
LIMIT 5;

-- 5. 배열 데이터 상세 확인
SELECT id, name, hazards, reception, laws, warning_symbols 
FROM msds_items 
WHERE id <= 3;
