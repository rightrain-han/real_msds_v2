-- ========================================
-- 중복된 설정 데이터 제거 스크립트
-- ========================================

-- 1. 현재 중복 데이터 확인
SELECT 
  type, 
  value, 
  label, 
  COUNT(*) as duplicate_count
FROM config_options 
GROUP BY type, value, label 
HAVING COUNT(*) > 1
ORDER BY type, label;

-- 2. 중복 데이터 제거 (ID가 가장 작은 것만 남기고 나머지 삭제)
DELETE FROM config_options 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM config_options 
  GROUP BY type, value, label
);

-- 3. 정리된 데이터 확인
SELECT 
  type,
  COUNT(*) as count,
  string_agg(label, ', ' ORDER BY label) as labels
FROM config_options 
GROUP BY type 
ORDER BY type;

-- 4. 전체 설정 데이터 목록 (타입별 정렬)
SELECT 
  id,
  type,
  value,
  label,
  is_active
FROM config_options 
ORDER BY 
  CASE type 
    WHEN 'usage' THEN 1 
    WHEN 'reception' THEN 2 
    WHEN 'laws' THEN 3 
    ELSE 4 
  END,
  label;

-- 5. 최종 개수 확인
SELECT 
  'usage' as type, 
  COUNT(*) as total 
FROM config_options 
WHERE type = 'usage'
UNION ALL
SELECT 
  'reception' as type, 
  COUNT(*) as total 
FROM config_options 
WHERE type = 'reception'
UNION ALL
SELECT 
  'laws' as type, 
  COUNT(*) as total 
FROM config_options 
WHERE type = 'laws';
