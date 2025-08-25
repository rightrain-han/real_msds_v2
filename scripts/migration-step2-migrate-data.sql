-- ========================================
-- 2단계: 기존 배열 데이터를 새 관계형 테이블로 마이그레이션
-- ========================================

-- 마이그레이션 시작 로그
SELECT 'Starting data migration...' as status, NOW() as timestamp;

-- 1. 경고 표지 데이터 마이그레이션
-- warning_symbols 배열에서 msds_warning_symbols 테이블로
INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id)
SELECT 
  m.id as msds_id,
  unnest(m.warning_symbols) as warning_symbol_id
FROM msds_items m
WHERE m.warning_symbols IS NOT NULL 
  AND array_length(m.warning_symbols, 1) > 0
ON CONFLICT (msds_id, warning_symbol_id) DO NOTHING;

-- 2. 보호 장구 데이터 마이그레이션
-- hazards 배열에서 msds_protective_equipment 테이블로
INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id)
SELECT 
  m.id as msds_id,
  unnest(m.hazards) as protective_equipment_id
FROM msds_items m
WHERE m.hazards IS NOT NULL 
  AND array_length(m.hazards, 1) > 0
ON CONFLICT (msds_id, protective_equipment_id) DO NOTHING;

-- 3. 장소 데이터 마이그레이션
-- reception 배열에서 msds_config_items 테이블로
INSERT INTO msds_config_items (msds_id, config_type, config_value)
SELECT 
  m.id as msds_id,
  'reception' as config_type,
  unnest(m.reception) as config_value
FROM msds_items m
WHERE m.reception IS NOT NULL 
  AND array_length(m.reception, 1) > 0
ON CONFLICT (msds_id, config_type, config_value) DO NOTHING;

-- 4. 관련법 데이터 마이그레이션
-- laws 배열에서 msds_config_items 테이블로
INSERT INTO msds_config_items (msds_id, config_type, config_value)
SELECT 
  m.id as msds_id,
  'laws' as config_type,
  unnest(m.laws) as config_value
FROM msds_items m
WHERE m.laws IS NOT NULL 
  AND array_length(m.laws, 1) > 0
ON CONFLICT (msds_id, config_type, config_value) DO NOTHING;

-- 5. 용도 데이터 마이그레이션 (usage는 단일 값이므로 직접 추가)
INSERT INTO msds_config_items (msds_id, config_type, config_value)
SELECT 
  m.id as msds_id,
  'usage' as config_type,
  m.usage as config_value
FROM msds_items m
WHERE m.usage IS NOT NULL 
  AND m.usage != ''
ON CONFLICT (msds_id, config_type, config_value) DO NOTHING;

-- 마이그레이션 결과 확인
SELECT 
  'msds_warning_symbols' as table_name, 
  COUNT(*) as migrated_records 
FROM msds_warning_symbols
UNION ALL
SELECT 
  'msds_protective_equipment' as table_name, 
  COUNT(*) as migrated_records 
FROM msds_protective_equipment
UNION ALL
SELECT 
  'msds_config_items (reception)' as table_name, 
  COUNT(*) as migrated_records 
FROM msds_config_items 
WHERE config_type = 'reception'
UNION ALL
SELECT 
  'msds_config_items (laws)' as table_name, 
  COUNT(*) as migrated_records 
FROM msds_config_items 
WHERE config_type = 'laws'
UNION ALL
SELECT 
  'msds_config_items (usage)' as table_name, 
  COUNT(*) as migrated_records 
FROM msds_config_items 
WHERE config_type = 'usage';

-- 마이그레이션 완료 로그
SELECT 'Data migration completed!' as status, NOW() as timestamp;
