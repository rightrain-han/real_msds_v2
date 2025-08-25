# PDF 파일 업로드 기능 가이드

## 🚨 v0 환경 제한사항

v0 미리보기 환경에서는 다음 기능들이 제한됩니다:

### 1. 파일 업로드 제한
- 실제 파일을 서버에 업로드할 수 없음
- Supabase Storage API 호출이 시뮬레이션됨
- 업로드 성공 메시지는 표시되지만 실제 파일은 저장되지 않음

### 2. 환경 변수 제한
- `SUPABASE_SERVICE_ROLE_KEY`가 실제로 작동하지 않음
- 파일 업로드 API가 실제 Supabase와 연결되지 않음

## ✅ 로컬 환경에서 실행하기

### 1. 프로젝트 다운로드
\`\`\`bash
# v0에서 "Download Code" 버튼 클릭
# 또는 GitHub에 푸시 후 클론
\`\`\`

### 2. 환경 설정
\`\`\`bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://sgtspimyffhsiyrgtvbf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### 3. Supabase Storage 버킷 생성
Supabase 대시보드에서:
1. Storage → Buckets
2. "Create bucket" 클릭
3. 이름: `msds-files`
4. Public bucket: ✅ 체크
5. "Save" 클릭

### 4. 로컬 서버 실행
\`\`\`bash
npm run dev
\`\`\`

### 5. 기능 테스트
1. http://localhost:3000/admin 접속
2. MSDS 항목 옆 업로드 버튼 클릭
3. PDF 파일 선택 및 업로드
4. 파일명이 실제로 업데이트되는지 확인
5. PDF 링크 클릭하여 파일이 열리는지 확인

## 🔧 현재 업로드 API 동작 방식

### 업로드 프로세스:
1. 클라이언트에서 PDF 파일 선택
2. `/api/upload/pdf` 엔드포인트로 전송
3. 파일 유효성 검사 (PDF, 10MB 이하)
4. Supabase Storage에 업로드
5. 공개 URL 생성
6. MSDS 테이블의 `pdf_file_name`, `pdf_file_url` 업데이트

### 파일명 규칙:
- 형식: `{timestamp}_{original_filename}`
- 예: `1750328210807_hydrochloric-acid-35.pdf`

## 🐛 문제 해결

### PDF가 열리지 않는 경우:
1. Supabase Storage 버킷이 Public인지 확인
2. 업로드된 파일의 URL이 올바른지 확인
3. 브라우저 개발자 도구에서 네트워크 오류 확인

### 파일명이 업데이트되지 않는 경우:
1. `SUPABASE_SERVICE_ROLE_KEY` 환경 변수 확인
2. 데이터베이스 권한 설정 확인
3. API 응답 로그 확인

## 📝 v0에서 시뮬레이션 확인

v0에서는 실제 업로드는 안 되지만 다음을 확인할 수 있습니다:
- 업로드 UI 동작
- 파일 유효성 검사 로직
- 성공/실패 메시지 표시
- 관리자 페이지 인터페이스
