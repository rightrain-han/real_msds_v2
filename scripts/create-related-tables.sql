-- 기존 테이블 삭제 (필요시)
-- DROP TABLE IF EXISTS msds_warning_symbols CASCADE;
-- DROP TABLE IF EXISTS msds_protective_equipment CASCADE;
-- DROP TABLE IF EXISTS msds_config_items CASCADE;

-- 1. 경고 표지와 MSDS 연결 테이블
CREATE TABLE IF NOT EXISTS msds_warning_symbols (
  id SERIAL PRIMARY KEY,
  msds_id INTEGER NOT NULL REFERENCES msds_items(id) ON DELETE CASCADE,
  warning_symbol_id VARCHAR(255) NOT NULL REFERENCES warning_symbols(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(msds_id, warning_symbol_id)
);

-- 2. 보호 장구와 MSDS 연결 테이블
CREATE TABLE IF NOT EXISTS msds_protective_equipment (
  id SERIAL PRIMARY KEY,
  msds_id INTEGER NOT NULL REFERENCES msds_items(id) ON DELETE CASCADE,
  protective_equipment_id VARCHAR(255) NOT NULL REFERENCES protective_equipment(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(msds_id, protective_equipment_id)
);

-- 3. 설정 항목과 MSDS 연결 테이블 (용도, 장소, 관련법)
CREATE TABLE IF NOT EXISTS msds_config_items (
  id SERIAL PRIMARY KEY,
  msds_id INTEGER NOT NULL REFERENCES msds_items(id) ON DELETE CASCADE,
  config_type VARCHAR(50) NOT NULL, -- 'usage', 'reception', 'laws'
  config_value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(msds_id, config_type, config_value)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_msds_warning_symbols_msds_id ON msds_warning_symbols(msds_id);
CREATE INDEX IF NOT EXISTS idx_msds_warning_symbols_symbol_id ON msds_warning_symbols(warning_symbol_id);
CREATE INDEX IF NOT EXISTS idx_msds_protective_equipment_msds_id ON msds_protective_equipment(msds_id);
CREATE INDEX IF NOT EXISTS idx_msds_protective_equipment_equipment_id ON msds_protective_equipment(protective_equipment_id);
CREATE INDEX IF NOT EXISTS idx_msds_config_items_msds_id ON msds_config_items(msds_id);
CREATE INDEX IF NOT EXISTS idx_msds_config_items_type ON msds_config_items(config_type);

-- RLS 정책 설정
ALTER TABLE msds_warning_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE msds_protective_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE msds_config_items ENABLE ROW LEVEL SECURITY;

-- 읽기 정책
CREATE POLICY "Allow read access for all users" ON msds_warning_symbols FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON msds_protective_equipment FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON msds_config_items FOR SELECT USING (true);

-- 쓰기 정책
CREATE POLICY "Allow write access for all users" ON msds_warning_symbols FOR ALL USING (true);
CREATE POLICY "Allow write access for all users" ON msds_protective_equipment FOR ALL USING (true);
CREATE POLICY "Allow write access for all users" ON msds_config_items FOR ALL USING (true);
