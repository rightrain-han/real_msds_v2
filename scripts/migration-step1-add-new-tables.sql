-- ========================================
-- 1단계: 새로운 관계형 테이블 추가
-- (기존 msds_items 테이블은 건드리지 않음)
-- ========================================

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

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_msds_warning_symbols_msds_id ON msds_warning_symbols(msds_id);
CREATE INDEX IF NOT EXISTS idx_msds_warning_symbols_symbol_id ON msds_warning_symbols(warning_symbol_id);
CREATE INDEX IF NOT EXISTS idx_msds_protective_equipment_msds_id ON msds_protective_equipment(msds_id);
CREATE INDEX IF NOT EXISTS idx_msds_protective_equipment_equipment_id ON msds_protective_equipment(protective_equipment_id);
CREATE INDEX IF NOT EXISTS idx_msds_config_items_msds_id ON msds_config_items(msds_id);
CREATE INDEX IF NOT EXISTS idx_msds_config_items_type ON msds_config_items(config_type);

-- RLS (Row Level Security) 활성화
ALTER TABLE msds_warning_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE msds_protective_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE msds_config_items ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정
CREATE POLICY "Allow all access for msds_warning_symbols" ON msds_warning_symbols FOR ALL USING (true);
CREATE POLICY "Allow all access for msds_protective_equipment" ON msds_protective_equipment FOR ALL USING (true);
CREATE POLICY "Allow all access for msds_config_items" ON msds_config_items FOR ALL USING (true);

-- 테이블 생성 확인
SELECT 
  'msds_warning_symbols' as table_name, 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'msds_warning_symbols') as created
UNION ALL
SELECT 
  'msds_protective_equipment' as table_name, 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'msds_protective_equipment') as created
UNION ALL
SELECT 
  'msds_config_items' as table_name, 
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'msds_config_items') as created;
