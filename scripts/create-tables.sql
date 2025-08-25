-- MSDS 테이블 생성
CREATE TABLE IF NOT EXISTS msds_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pdf_file_name VARCHAR(255),
  pdf_file_url TEXT,
  hazards TEXT[] DEFAULT '{}',
  usage VARCHAR(255) NOT NULL,
  reception TEXT[] DEFAULT '{}',
  laws TEXT[] DEFAULT '{}',
  warning_symbols TEXT[] DEFAULT '{}',
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 경고 표지 테이블
CREATE TABLE IF NOT EXISTS warning_symbols (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(50) DEFAULT 'physical',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 보호 장구 테이블
CREATE TABLE IF NOT EXISTS protective_equipment (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(50) DEFAULT 'respiratory',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 설정 옵션 테이블
CREATE TABLE IF NOT EXISTS config_options (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'usage', 'reception', 'laws'
  value VARCHAR(255) NOT NULL,
  label VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_msds_items_name ON msds_items(name);
CREATE INDEX IF NOT EXISTS idx_msds_items_usage ON msds_items(usage);
CREATE INDEX IF NOT EXISTS idx_config_options_type ON config_options(type);

-- RLS (Row Level Security) 활성화
ALTER TABLE msds_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE warning_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE protective_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_options ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 설정
CREATE POLICY "Allow read access for all users" ON msds_items FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON warning_symbols FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON protective_equipment FOR SELECT USING (true);
CREATE POLICY "Allow read access for all users" ON config_options FOR SELECT USING (true);

-- 관리자만 쓰기 가능하도록 정책 설정 (나중에 인증 시스템 추가 시 수정)
CREATE POLICY "Allow write access for all users" ON msds_items FOR ALL USING (true);
CREATE POLICY "Allow write access for all users" ON warning_symbols FOR ALL USING (true);
CREATE POLICY "Allow write access for all users" ON protective_equipment FOR ALL USING (true);
CREATE POLICY "Allow write access for all users" ON config_options FOR ALL USING (true);
