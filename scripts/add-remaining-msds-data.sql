-- 나머지 MSDS 데이터 추가 (JSON 파일의 모든 데이터를 Supabase로 마이그레이션)

-- 4. 황산마그네슘 용액
INSERT INTO msds_items (id, name, pdf_file_name, usage) VALUES
(4, '황산마그네슘 용액', 'MAGNESIUM_SULFATE.pdf', '폐수처리')
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;

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

-- 시퀀스 업데이트 (다음 ID가 올바르게 생성되도록)
SELECT setval('msds_items_id_seq', (SELECT MAX(id) FROM msds_items));
