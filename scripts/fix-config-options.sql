-- 설정 옵션 테이블 확인 및 기본 데이터 삽입
-- 기존 데이터가 있으면 무시하고, 없으면 삽입

-- 용도 옵션들
INSERT INTO config_options (type, value, label, is_active) 
VALUES 
  ('usage', 'pure_reagent', '순수시약', true),
  ('usage', 'nox_reduction', 'NOx저감', true),
  ('usage', 'wastewater_treatment', '폐수처리', true),
  ('usage', 'boiler_water_treatment', '보일러용수처리', true),
  ('usage', 'chemical_field', '과학물질분야', true),
  ('usage', 'fuel', '연료', true),
  ('usage', 'disinfectant_gas', '소독용 가스', true),
  ('usage', 'generator_cooling', '발전기 냉각', true),
  ('usage', 'purge', 'Purge', true),
  ('usage', 'insulation', '절연', true),
  ('usage', 'cleaning_agent', '세정제', true)
ON CONFLICT (type, value) DO NOTHING;

-- 장소 옵션들
INSERT INTO config_options (type, value, label, is_active) 
VALUES 
  ('reception', 'lng_3_cpp', 'LNG 3호기 CPP', true),
  ('reception', 'lng_4_cpp', 'LNG 4호기 CPP', true),
  ('reception', 'water_treatment', '수처리동', true),
  ('reception', 'bio_2_scr', 'BIO 2호기 SCR', true),
  ('reception', 'lng_4_scr', 'LNG 4호기 SCR', true),
  ('reception', 'power_plant_boiler', '발전소 보일러', true),
  ('reception', 'do_tank', 'DO TANK', true),
  ('reception', 'lng_boiler', 'LNG 보일러', true)
ON CONFLICT (type, value) DO NOTHING;

-- 관련법 옵션들
INSERT INTO config_options (type, value, label, is_active) 
VALUES 
  ('laws', 'chemical_safety', '화학물질안전법', true),
  ('laws', 'industrial_safety', '산업안전보건법', true)
ON CONFLICT (type, value) DO NOTHING;

-- 데이터 확인
SELECT 
  type,
  COUNT(*) as count,
  STRING_AGG(label, ', ' ORDER BY label) as labels
FROM config_options 
WHERE is_active = true 
GROUP BY type 
ORDER BY type;
