# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정 생성/로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호 설정
4. 리전 선택 (한국의 경우 Northeast Asia (Seoul) 권장)
5. 프로젝트 생성 완료까지 대기 (약 2-3분)

## 2. API 키 확인

1. 생성된 프로젝트 대시보드에서 **Settings** → **API** 메뉴로 이동
2. 다음 정보를 복사:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Service Role Key**: `eyJ...` (매우 긴 문자열)

⚠️ **주의**: Service Role Key는 절대 공개하지 마세요!

## 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

## 4. 데이터베이스 테이블 생성

1. Supabase 대시보드에서 **SQL Editor** 메뉴로 이동
2. 제공된 SQL 스크립트들을 순서대로 실행:
   - `scripts/create-tables.sql`
   - `scripts/insert-default-data-fixed.sql`
   - `scripts/create-related-tables.sql`
   - `scripts/insert-all-20-msds-items.sql`

## 5. 연결 테스트

관리자 페이지에서 "연결 상태" 카드를 확인하여 연결이 성공했는지 확인하세요.

## 문제 해결

### "연결 실패" 오류가 발생하는 경우:

1. **환경 변수 확인**:
   - `.env.local` 파일이 프로젝트 루트에 있는지 확인
   - URL과 키가 정확히 복사되었는지 확인
   - 개발 서버 재시작 (`npm run dev`)

2. **Supabase 프로젝트 상태 확인**:
   - 프로젝트가 활성 상태인지 확인
   - 데이터베이스가 정상 작동하는지 확인

3. **네트워크 문제**:
   - 방화벽이나 VPN이 연결을 차단하지 않는지 확인
   - 인터넷 연결 상태 확인

### 자주 발생하는 오류:

- `Failed to create Supabase client`: 환경 변수 누락 또는 잘못된 형식
- `Invalid API key`: Service Role Key가 아닌 anon key를 사용한 경우
- `relation does not exist`: 테이블이 생성되지 않은 경우

도움이 필요하면 Supabase 대시보드의 로그를 확인하거나 브라우저 개발자 도구의 콘솔을 확인하세요.
