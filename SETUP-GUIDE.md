# 🚀 MSDS 시스템 설정 가이드

## 1. 프로젝트 다운로드 후 필수 설정

### 📁 환경 변수 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

\`\`\`bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://sgtspimyffhsiyrgtvbf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndHNwaW15ZmZoc2l5cmd0dmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjAzNTUsImV4cCI6MjA2NTg5NjM1NX0.uFw1K40xmNYnPDqMRzo3Co-ggukEuVul5zDVSw9hDEo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndHNwaW15ZmZoc2l5cmd0dmJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDM1NSwiZXhwIjoyMDY1ODk2MzU1fQ.SOntd-Vp7IvYdqnlheX8Ctnwr6Xk1l7rzpY8w-fe6nA

# 기본 URL (선택사항)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

### 📦 의존성 설치
\`\`\`bash
npm install
\`\`\`

### 🗄️ 데이터베이스 설정
Supabase 대시보드에서 SQL Editor를 열고 다음 스크립트들을 순서대로 실행:

1. `scripts/create-tables.sql`
2. `scripts/insert-default-data-fixed.sql`
3. `scripts/create-related-tables.sql`
4. `scripts/insert-all-20-msds-items.sql`

### 🚀 개발 서버 실행
\`\`\`bash
npm run dev
\`\`\`

## 2. 확인 사항

### ✅ 환경 변수 확인
- [ ] `.env.local` 파일이 프로젝트 루트에 있는가?
- [ ] Supabase URL과 키가 올바른가?
- [ ] 개발 서버를 재시작했는가?

### ✅ Supabase 설정 확인
- [ ] Supabase 프로젝트가 활성 상태인가?
- [ ] `msds-files` Storage 버킷이 Public으로 설정되었는가?
- [ ] 데이터베이스 테이블들이 생성되었는가?

### ✅ 기능 테스트
- [ ] http://localhost:3000 접속 가능한가?
- [ ] http://localhost:3000/admin 관리자 페이지 작동하는가?
- [ ] 연결 상태가 "연결됨"으로 표시되는가?

## 3. 문제 해결

### 🔴 "연결 실패" 오류
1. `.env.local` 파일 확인
2. Supabase 프로젝트 상태 확인
3. 개발 서버 재시작

### 🔴 PDF 업로드 실패
1. Supabase Storage 버킷 설정 확인
2. Service Role Key 확인
3. 파일 크기 제한 (10MB) 확인

### 🔴 데이터가 표시되지 않음
1. 데이터베이스 스크립트 실행 확인
2. API 엔드포인트 테스트
3. 브라우저 개발자 도구 콘솔 확인

## 4. 추가 정보

- 📚 [Supabase 설정 가이드](./SUPABASE-SETUP.md)
- 📄 [PDF 업로드 가이드](./README-PDF-UPLOAD.md)
- 🐛 문제가 지속되면 브라우저 개발자 도구의 콘솔과 네트워크 탭을 확인하세요.
