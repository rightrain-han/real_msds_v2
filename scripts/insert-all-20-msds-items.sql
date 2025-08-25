-- ========================================
-- 전체 20개 MSDS 데이터를 Supabase에 추가
-- ========================================

-- 기존 데이터 삭제 (새로 시작하려면)
-- DELETE FROM msds_config_items;
-- DELETE FROM msds_protective_equipment;
-- DELETE FROM msds_warning_symbols;
-- DELETE FROM msds_items;

-- 1. 염산 35%
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(1, '염산 35%', 'HYDROCHLORIC_ACID.pdf', '순수시약')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(1, 'corrosive'), (1, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(1, 'corrosive'), (1, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(1, 'reception', 'LNG 3호기 CPP'),
(1, 'reception', 'LNG 4호기 CPP'),
(1, 'reception', '수처리동'),
(1, 'laws', '화학물질안전법'),
(1, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 2. 가성소다 45%
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(2, '가성소다 45%', 'SODIUM_HYDROXIDE.pdf', '순수시약')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(2, 'corrosive')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(2, 'corrosive')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(2, 'reception', 'LNG 3호기 CPP'),
(2, 'reception', 'LNG 4호기 CPP'),
(2, 'reception', '수처리동'),
(2, 'laws', '화학물질안전법'),
(2, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 3. 암모니아수 25%
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(3, '암모니아수 25%', 'AMMONIA_SOLUTION.pdf', 'NOx저감')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(3, 'toxic'), (3, 'corrosive'), (3, 'environmental')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(3, 'toxic'), (3, 'corrosive')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(3, 'reception', 'BIO 2호기 SCR'),
(3, 'reception', 'LNG 4호기 SCR'),
(3, 'laws', '화학물질안전법'),
(3, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 4. 황산마그네슘 용액
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(4, '황산마그네슘 용액', 'MAGNESIUM_SULFATE.pdf', '폐수처리')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(4, 'corrosive')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(4, 'corrosive')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(4, 'reception', '수처리동'),
(4, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 5. 스케일방지제
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(5, '스케일방지제', 'SCALE_INHIBITOR.pdf', '순수시약')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(5, 'toxic'), (5, 'corrosive')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(5, 'toxic'), (5, 'corrosive')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(5, 'reception', '수처리동'),
(5, 'laws', '화학물질안전법'),
(5, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 6. 탈산소제
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(6, '탈산소제', 'OXYGEN_SCAVENGER.pdf', '보일러용수처리')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(6, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(6, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(6, 'reception', '발전소 보일러'),
(6, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 7. 안티폼제제
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(7, '안티폼제제', 'ANTIFOAM.pdf', '과학물질분야')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(7, 'health_hazard')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(7, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(7, 'reception', '발전소 보일러'),
(7, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 8. 산동화제
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(8, '산동화제', 'OXIDIZER.pdf', '과학물질분야')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(8, 'oxidizing')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(8, 'oxidizing')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(8, 'reception', '발전소 보일러'),
(8, 'laws', '화학물질안전법'),
(8, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 9. 경유
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(9, '경유', 'DIESEL.pdf', '연료')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(9, 'flammable'), (9, 'toxic'), (9, 'health_hazard')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(9, 'flammable'), (9, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(9, 'reception', 'DO TANK'),
(9, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 10. 이소시안산
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(10, '이소시안산', 'ISOCYANIC_ACID.pdf', '소독용 가스')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(10, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(10, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(10, 'reception', '발전소 보일러'),
(10, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 11. 수소
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(11, '수소', 'HYDROGEN.pdf', '발전기 냉각')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(11, 'flammable')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(11, 'flammable')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(11, 'reception', 'LNG 보일러'),
(11, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 12. 질소
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(12, '질소', 'NITROGEN.pdf', 'Purge')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(12, 'health_hazard')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(12, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(12, 'reception', 'LNG 보일러')
ON CONFLICT DO NOTHING;

-- 13. 수용성 절연유
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(13, '수용성 절연유', 'WATER_SOLUBLE_INSULATION.pdf', '절연')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(13, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(13, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(13, 'reception', '발전소 보일러')
ON CONFLICT DO NOTHING;

-- 14. 금속 탈지 세정제
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(14, '금속 탈지 세정제', 'METAL_DEGREASER.pdf', '절연')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(14, 'toxic'), (14, 'corrosive')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(14, 'toxic'), (14, 'corrosive')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(14, 'reception', '발전소 보일러'),
(14, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 15. 디젤로 세정제
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(15, '디젤로 세정제', 'DIESEL_CLEANER.pdf', '절연')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(15, 'flammable'), (15, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(15, 'flammable'), (15, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(15, 'reception', '발전소 보일러'),
(15, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 16. Citric Acid
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(16, 'Citric Acid', 'CITRIC_ACID.pdf', '세정제')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(16, 'corrosive')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(16, 'corrosive')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(16, 'reception', '수처리동')
ON CONFLICT DO NOTHING;

-- 17. 천연가스(LNG)
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(17, '천연가스(LNG)', 'LNG.pdf', '연료')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(17, 'flammable')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(17, 'flammable')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(17, 'reception', '발전소 보일러'),
(17, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 18. 예비석유가스
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(18, '예비석유가스', 'BACKUP_GAS.pdf', '절연')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_warning_symbols (msds_id, warning_symbol_id) VALUES
(18, 'flammable'), (18, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_protective_equipment (msds_id, protective_equipment_id) VALUES
(18, 'flammable'), (18, 'toxic')
ON CONFLICT DO NOTHING;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(18, 'reception', '발전소 보일러'),
(18, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 19. 브로모메틸 청산
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(19, '브로모메틸 청산', 'BROMOMETHYL_ACID.pdf', '세정제')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(19, 'reception', '수처리동')
ON CONFLICT DO NOTHING;

-- 20. Buffer solution pH 4.00
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(20, 'Buffer solution pH 4.00', 'BUFFER_SOLUTION_PH4.pdf', '세정제')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  pdf_file_name = EXCLUDED.pdf_file_name,
  usage = EXCLUDED.usage;

INSERT INTO msds_config_items (msds_id, config_type, config_value) VALUES
(20, 'reception', '수처리동'),
(20, 'laws', '산업안전보건법')
ON CONFLICT DO NOTHING;

-- 시퀀스 업데이트 (다음 ID가 올바르게 생성되도록)
SELECT setval('msds_items_id_seq', (SELECT MAX(id) FROM msds_items));

-- 결과 확인
SELECT 
  'MSDS Items' as table_name, 
  COUNT(*) as total_count 
FROM msds_items
UNION ALL
SELECT 
  'Warning Symbols Relations' as table_name, 
  COUNT(*) as total_count 
FROM msds_warning_symbols
UNION ALL
SELECT 
  'Protective Equipment Relations' as table_name, 
  COUNT(*) as total_count 
FROM msds_protective_equipment
UNION ALL
SELECT 
  'Config Items' as table_name, 
  COUNT(*) as total_count 
FROM msds_config_items;

-- 최종 확인: 각 MSDS별 관련 데이터 개수
SELECT 
  m.id,
  m.name,
  COALESCE(ws_count.count, 0) as warning_symbols_count,
  COALESCE(pe_count.count, 0) as protective_equipment_count,
  COALESCE(ci_count.count, 0) as config_items_count
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
  GROUP BY msds_id
) ci_count ON m.id = ci_count.msds_id
ORDER BY m.id;
