# 🚀 MSDS 시스템 실제 배포 가이드

## 1. 배포 준비 사항

### ✅ 사전 체크리스트
- [ ] Supabase 프로젝트가 정상 작동하는지 확인
- [ ] 로컬에서 모든 기능이 정상 작동하는지 테스트
- [ ] 환경변수가 올바르게 설정되어 있는지 확인
- [ ] 데이터베이스 테이블과 데이터가 준비되어 있는지 확인

## 2. Vercel 배포 방법

### 방법 1: GitHub 연동 배포 (권장)

#### Step 1: GitHub 리포지토리 생성
\`\`\`bash
# 1. GitHub에서 새 리포지토리 생성
# 2. 로컬 프로젝트를 Git 리포지토리로 초기화
git init
git add .
git commit -m "Initial commit: MSDS System"

# 3. GitHub 리포지토리와 연결
git remote add origin https://github.com/your-username/msds-system.git
git branch -M main
git push -u origin main
\`\`\`

#### Step 2: Vercel에서 프로젝트 import
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "New Project" 클릭
3. GitHub 리포지토리 선택
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)

#### Step 3: 환경변수 설정
Vercel Dashboard → Settings → Environment Variables에서 추가:

\`\`\`bash
# Production 환경변수
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
\`\`\`

**⚠️ 중요사항:**
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 공개하지 마세요
- 모든 환경(Production, Preview, Development)에 동일하게 설정
- 환경변수 설정 후 재배포 필요

### 방법 2: Vercel CLI 배포

#### Step 1: Vercel CLI 설치 및 로그인
\`\`\`bash
# Vercel CLI 설치
npm i -g vercel

# Vercel 로그인
vercel login
\`\`\`

#### Step 2: 프로젝트 배포
\`\`\`bash
# 프로젝트 루트에서 실행
vercel

# 첫 배포 시 질문에 답변:
# ? Set up and deploy "~/msds-system"? [Y/n] y
# ? Which scope do you want to deploy to? [your-team]
# ? Link to existing project? [y/N] n
# ? What's your project's name? msds-system
# ? In which directory is your code located? ./
\`\`\`

#### Step 3: Production 배포
\`\`\`bash
# Production 환경으로 배포
vercel --prod
\`\`\`

## 3. 환경변수 설정 상세

### Vercel Dashboard에서 설정
1. 프로젝트 → Settings → Environment Variables
2. 다음 변수들을 **모든 환경**에 추가:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase Service Role Key |
| `NEXT_PUBLIC_BASE_URL` | `https://your-app.vercel.app` | 배포된 앱의 URL |

### 환경변수 확인 방법
\`\`\`bash
# Vercel CLI로 환경변수 확인
vercel env ls

# 특정 환경의 환경변수 가져오기
vercel env pull .env.production
\`\`\`

## 4. 도메인 설정 (선택사항)

### 커스텀 도메인 연결
1. Vercel Dashboard → Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: `msds.yourcompany.com`)
4. DNS 설정:
   \`\`\`
   Type: CNAME
   Name: msds (또는 원하는 서브도메인)
   Value: cname.vercel-dns.com
   \`\`\`

## 5. 배포 후 확인사항

### ✅ 배포 성공 체크리스트
- [ ] 메인 페이지가 정상 로드되는지 확인
- [ ] 관리자 페이지 접속 가능한지 확인
- [ ] Supabase 연결 상태가 "연결됨"으로 표시되는지 확인
- [ ] MSDS 데이터가 정상 표시되는지 확인
- [ ] PDF 업로드 기능이 작동하는지 확인
- [ ] QR 코드 생성이 정상 작동하는지 확인

### 🔍 문제 해결
배포 후 문제가 발생하면:

1. **Vercel Function Logs 확인**
   \`\`\`bash
   vercel logs
   \`\`\`

2. **브라우저 개발자 도구 확인**
   - Console 탭에서 JavaScript 오류 확인
   - Network 탭에서 API 요청 실패 확인

3. **환경변수 재확인**
   \`\`\`bash
   # 환경변수가 올바르게 설정되었는지 확인
   vercel env ls
   \`\`\`

## 6. 지속적 배포 (CI/CD) 설정

### GitHub Actions 자동 배포
GitHub 리포지토리에 연결된 경우, 자동으로 설정됩니다:

- `main` 브랜치에 push → Production 배포
- 다른 브랜치에 push → Preview 배포
- Pull Request 생성 → Preview 배포

### 수동 배포 트리거
\`\`\`bash
# 특정 브랜치 배포
vercel --prod --confirm

# 특정 커밋 배포
git checkout <commit-hash>
vercel --prod
\`\`\`

## 7. 성능 최적화

### 이미지 최적화
\`\`\`javascript
// next.config.mjs에 추가
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
}

export default nextConfig
\`\`\`

### 캐싱 설정
\`\`\`javascript
// API 라우트에서 캐시 헤더 설정
export async function GET() {
  const data = await fetchData()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
\`\`\`

## 8. 보안 설정

### Supabase RLS (Row Level Security) 확인
\`\`\`sql
-- 테이블별 RLS 정책 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 정책 확인
SELECT * FROM pg_policies WHERE schemaname = 'public';
\`\`\`

### 환경변수 보안
- Service Role Key는 절대 클라이언트 코드에 노출하지 않기
- `.env.local` 파일은 `.gitignore`에 포함되어 있는지 확인
- GitHub에 환경변수가 커밋되지 않았는지 확인

## 9. 모니터링 설정

### Vercel Analytics 활성화
1. Vercel Dashboard → Analytics
2. "Enable Analytics" 클릭
3. 사용량 및 성능 모니터링 가능

### 에러 모니터링
\`\`\`javascript
// 글로벌 에러 핸들러 추가 (app/global-error.tsx)
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('Global error:', error)
  
  return (
    <html>
      <body>
        <h2>문제가 발생했습니다!</h2>
        <button onClick={() => reset()}>다시 시도</button>
      </body>
    </html>
  )
}
\`\`\`

## 10. 백업 및 복구

### 데이터베이스 백업
\`\`\`bash
# Supabase CLI로 백업
supabase db dump --file backup.sql

# 복구
supabase db reset --file backup.sql
\`\`\`

### 코드 백업
- GitHub 리포지토리가 자동 백업 역할
- 정기적으로 태그 생성하여 버전 관리
\`\`\`bash
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
\`\`\`

---

## 🎉 배포 완료!

배포가 완료되면 다음 URL에서 접속 가능합니다:
- **Production**: `https://your-app-name.vercel.app`
- **관리자 페이지**: `https://your-app-name.vercel.app/admin`

문제가 발생하면 [Vercel 문서](https://vercel.com/docs) 또는 [Supabase 문서](https://supabase.com/docs)를 참조하세요.
