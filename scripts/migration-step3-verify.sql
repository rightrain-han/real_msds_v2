-- ========================================
-- 3단계: 마이그레이션 검증
-- ========================================

-- 1. 전체 데이터 개수 비교
SELECT 'Data Count Verification' as check_type;

WITH old_data AS (
  SELECT 
    COUNT(*) as total_msds,
    SUM(COALESCE(array_length(warning_symbols, 1), 0)) as total_warning_symbols,
    SUM(COALESCE(array_length(hazards, 1), 0)) as total_hazards,
    SUM(COALESCE(array_length(reception, 1), 0)) as total_reception,
    SUM(COALESCE(array_length(laws, 1), 0)) as total_laws
  FROM msds_items
),
new_data AS (
  SELECT 
    (SELECT COUNT(*) FROM msds_items) as total_msds,
    (SELECT COUNT(*) FROM msds_warning_symbols) as total_warning_symbols,
    (SELECT COUNT(*) FROM msds_protective_equipment) as total_hazards,
    (SELECT COUNT(*) FROM msds_config_items WHERE config_type = 'reception') as total_reception,
    (SELECT COUNT(*) FROM msds_config_items WHERE config_type = 'laws') as total_laws
)
SELECT 
  'MSDS Items' as data_type,
  old_data.total_msds as old_count,
  new_data.total_msds as new_count,
  (old_data.total_msds = new_data.total_msds) as match
FROM old_data, new_data
UNION ALL
SELECT 
  'Warning Symbols' as data_type,
  old_data.total_warning_symbols as old_count,
  new_data.total_warning_symbols as new_count,
  (old_data.total_warning_symbols = new_data.total_warning_symbols) as match
FROM old_data, new_data
UNION ALL
SELECT 
  'Protective Equipment' as data_type,
  old_data.total_hazards as old_count,
  new_data.total_hazards as new_count,
  (old_data.total_hazards = new_data.total_hazards) as match
FROM old_data, new_data
UNION ALL
SELECT 
  'Reception' as data_type,
  old_data.total_reception as old_count,
  new_data.total_reception as new_count,
  (old_data.total_reception = new_data.total_reception) as match
FROM old_data, new_data
UNION ALL
SELECT 
  'Laws' as data_type,
  old_data.total_laws as old_count,
  new_data.total_laws as new_count,
  (old_data.total_laws = new_data.total_laws) as match
FROM old_data, new_data;

-- 2. 개별 MSDS 항목별 상세 비교 (처음 5개)
SELECT '
Individual Item Verification (First 5 items)' as check_type;

SELECT 
  m.id,
  m.name,
  -- 기존 배열 데이터
  COALESCE(array_length(m.warning_symbols, 1), 0) as old_warning_count,
  COALESCE(array_length(m.hazards, 1), 0) as old_hazards_count,
  COALESCE(array_length(m.reception, 1), 0) as old_reception_count,
  COALESCE(array_length(m.laws, 1), 0) as old_laws_count,
  -- 새 관계형 데이터
  COALESCE(ws_count.count, 0) as new_warning_count,
  COALESCE(pe_count.count, 0) as new_hazards_count,
  COALESCE(ci_r_count.count, 0) as new_reception_count,
  COALESCE(ci_l_count.count, 0) as new_laws_count,
  -- 일치 여부
  (COALESCE(array_length(m.warning_symbols, 1), 0) = COALESCE(ws_count.count, 0)) as warning_match,
  (COALESCE(array_length(m.hazards, 1), 0) = COALESCE(pe_count.count, 0)) as hazards_match,
  (COALESCE(array_length(m.reception, 1), 0) = COALESCE(ci_r_count.count, 0)) as reception_match,
  (COALESCE(array_length(m.laws, 1), 0) = COALESCE(ci_l_count.count, 0)) as laws_match
FROM msds_items m
LEFT JOIN (
  SELECT msds_id, COUNT(*) as count 
  FROM msds_warning_symbols 
  GROUP BY msds_id
) ws_count ON m.id = ws_count.msds_id
LEFT JOIN (
  SELECT msds_id, COUNT(*) as count 
  FROM msds_protective_equipment 
  GROUP BY msds_id
) pe_count ON m.id = pe_count.msds_id
LEFT JOIN (
  SELECT msds_id, COUNT(*) as count 
  FROM msds_config_items 
  WHERE config_type = 'reception'
  GROUP BY msds_id
) ci_r_count ON m.id = ci_r_count.msds_id
LEFT JOIN (
  SELECT msds_id, COUNT(*) as count 
  FROM msds_config_items 
  WHERE config_type = 'laws'
  GROUP BY msds_id
) ci_l_count ON m.id = ci_l_count.msds_id
ORDER BY m.id
LIMIT 5;

-- 3. 데이터 내용 비교 (첫 번째 항목)
SELECT '
Content Verification (First item)' as check_type;

SELECT 
  m.id,
  m.name,
  m.warning_symbols as old_warning_symbols,
  array_agg(DISTINCT ws.warning_symbol_id ORDER BY ws.warning_symbol_id) FILTER (WHERE ws.warning_symbol_id IS NOT NULL) as new_warning_symbols,
  m.hazards as old_hazards,
  array_agg(DISTINCT pe.protective_equipment_id ORDER BY pe.protective_equipment_id) FILTER (WHERE pe.protective_equipment_id IS NOT NULL) as new_hazards,
  m.reception as old_reception,
  array_agg(DISTINCT ci_r.config_value ORDER BY ci_r.config_value) FILTER (WHERE ci_r.config_value IS NOT NULL) as new_reception,
  m.laws as old_laws,
  array_agg(DISTINCT ci_l.config_value ORDER BY ci_l.config_value) FILTER (WHERE ci_l.config_value IS NOT NULL) as new_laws
FROM msds_items m
LEFT JOIN msds_warning_symbols ws ON m.id = ws.msds_id
LEFT JOIN msds_protective_equipment pe ON m.id = pe.msds_id
LEFT JOIN msds_config_items ci_r ON m.id = ci_r.msds_id AND ci_r.config_type = 'reception'
LEFT JOIN msds_config_items ci_l ON m.id = ci_l.msds_id AND ci_l.config_type = 'laws'
WHERE m.id = 1
GROUP BY m.id, m.name, m.warning_symbols, m.hazards, m.reception, m.laws;

-- 4. 마이그레이션 성공 여부 최종 확인
SELECT '
Migration Success Check' as check_type;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM msds_warning_symbols) 
     AND EXISTS (SELECT 1 FROM msds_protective_equipment)
     AND EXISTS (SELECT 1 FROM msds_config_items)
    THEN '✅ Migration Successful - All new tables have data'
    ELSE '❌ Migration Issue - Some tables are empty'
  END as migration_status;
