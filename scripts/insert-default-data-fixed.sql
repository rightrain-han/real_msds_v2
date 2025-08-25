-- 기본 경고 표지 데이터 삽입 (중복 방지)
INSERT INTO warning_symbols (id, name, description, image_url, category) VALUES
('corrosive', '부식성', '피부나 눈에 심각한 화상을 일으킬 수 있음', '/images/symbols/corrosive.png', 'physical'),
('health_hazard', '건강 유해성', '호흡기, 생식기능 또는 기타 장기에 손상을 일으킬 수 있음', '/images/symbols/health_hazard.png', 'health'),
('toxic', '독성', '삼키거나 흡입하면 생명에 위험할 수 있음', '/images/symbols/toxic.png', 'health'),
('environmental', '환경 유해성', '수생생물에 유독하며 장기적 영향을 일으킬 수 있음', '/images/symbols/environmental.png', 'environmental'),
('flammable', '인화성', '쉽게 불이 붙을 수 있음', '/images/symbols/flammable.png', 'physical'),
('oxidizing', '산화성', '화재를 일으키거나 강화시킬 수 있음', '/images/symbols/oxidizing.png', 'physical')
ON CONFLICT (id) DO NOTHING;

-- 기본 보호 장구 데이터 삽입 (중복 방지)
INSERT INTO protective_equipment (id, name, description, image_url, category) VALUES
('flammable', '인화성 보호구', '인화성 물질 취급 시 착용', '/images/protective/flammable.png', 'body'),
('toxic', '독성 보호구', '독성 물질 취급 시 착용', '/images/protective/toxic.png', 'respiratory'),
('corrosive', '부식성 보호구', '부식성 물질 취급 시 착용', '/images/protective/corrosive.png', 'eye'),
('oxidizing', '산화성 보호구', '산화성 물질 취급 시 착용', '/images/protective/oxidizing.png', 'hand')
ON CONFLICT (id) DO NOTHING;

-- 기본 설정 옵션 데이터 삽입 (중복 완전 방지)
INSERT INTO config_options (type, value, label) 
SELECT * FROM (VALUES
  -- 용도 옵션
  ('usage', 'pure_reagent', '순수시약'),
  ('usage', 'nox_reduction', 'NOx저감'),
  ('usage', 'wastewater_treatment', '폐수처리'),
  ('usage', 'boiler_water_treatment', '보일러용수처리'),
  ('usage', 'chemical_field', '과학물질분야'),
  ('usage', 'fuel', '연료'),
  ('usage', 'disinfectant_gas', '소독용 가스'),
  ('usage', 'generator_cooling', '발전기 냉각'),
  ('usage', 'purge', 'Purge'),
  ('usage', 'insulation', '절연'),
  ('usage', 'cleaning_agent', '세정제'),
  
  -- 장소 옵션
  ('reception', 'lng_3_cpp', 'LNG 3호기 CPP'),
  ('reception', 'lng_4_cpp', 'LNG 4호기 CPP'),
  ('reception', 'water_treatment', '수처리동'),
  ('reception', 'bio_2_scr', 'BIO 2호기 SCR'),
  ('reception', 'lng_4_scr', 'LNG 4호기 SCR'),
  ('reception', 'power_plant_boiler', '발전소 보일러'),
  ('reception', 'do_tank', 'DO TANK'),
  ('reception', 'lng_boiler', 'LNG 보일러'),
  
  -- 관련법 옵션
  ('laws', 'chemical_safety_law', '화학물질안전법'),
  ('laws', 'industrial_safety_law', '산업안전보건법')
) AS new_data(type, value, label)
WHERE NOT EXISTS (
  SELECT 1 FROM config_options 
  WHERE config_options.type = new_data.type 
  AND config_options.value = new_data.value 
  AND config_options.label = new_data.label
);
