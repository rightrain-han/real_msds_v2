#!/bin/bash

# 🚀 MSDS 시스템 프로덕션 배포 스크립트
# 이 스크립트는 프로덕션 배포 전 모든 체크를 수행합니다.

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 MSDS 시스템 프로덕션 배포를 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 함수: 성공 메시지
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 함수: 경고 메시지
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 함수: 에러 메시지
error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# 1. 환경 확인
echo "📋 1. 환경 확인 중..."

# Node.js 버전 확인
if ! command -v node &> /dev/null; then
    error "Node.js가 설치되지 않았습니다."
fi

NODE_VERSION=$(node --version)
success "Node.js 버전: $NODE_VERSION"

# npm 확인
if ! command -v npm &> /dev/null; then
    error "npm이 설치되지 않았습니다."
fi

NPM_VERSION=$(npm --version)
success "npm 버전: $NPM_VERSION"

# Git 상태 확인
if [ -n "$(git status --porcelain)" ]; then
    warning "커밋되지 않은 변경사항이 있습니다."
    echo "변경사항을 커밋하시겠습니까? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git add .
        echo "커밋 메시지를 입력하세요:"
        read -r commit_message
        git commit -m "$commit_message"
        success "변경사항이 커밋되었습니다."
    else
        error "배포를 중단합니다. 먼저 변경사항을 커밋해주세요."
    fi
fi

success "Git 상태가 깨끗합니다."

# 2. 의존성 설치 및 빌드 테스트
echo "📦 2. 의존성 설치 및 빌드 테스트 중..."

npm ci
success "의존성 설치 완료"

npm run build
success "빌드 테스트 완료"

# 3. 환경변수 확인
echo "🔐 3. 환경변수 확인 중..."

if [ ! -f ".env.local" ]; then
    warning ".env.local 파일이 없습니다. 프로덕션에서는 Vercel 환경변수를 사용합니다."
else
    success ".env.local 파일이 존재합니다."
fi

# 4. Vercel CLI 확인
echo "🔧 4. Vercel CLI 확인 중..."

if ! command -v vercel &> /dev/null; then
    warning "Vercel CLI가 설치되지 않았습니다. 설치하시겠습니까? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        npm install -g vercel
        success "Vercel CLI 설치 완료"
    else
        error "Vercel CLI가 필요합니다. 'npm install -g vercel'로 설치해주세요."
    fi
fi

# Vercel 로그인 확인
if ! vercel whoami &> /dev/null; then
    warning "Vercel에 로그인되지 않았습니다. 로그인하시겠습니까? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        vercel login
        success "Vercel 로그인 완료"
    else
        error "Vercel 로그인이 필요합니다."
    fi
fi

success "Vercel CLI 준비 완료"

# 5. 배포 확인
echo "🚀 5. 배포를 진행하시겠습니까?"
echo "   - 현재 브랜치: $(git branch --show-current)"
echo "   - 마지막 커밋: $(git log -1 --pretty=format:'%h - %s (%an, %ar)')"
echo ""
echo "프로덕션 배포를 진행하시겠습니까? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "🚀 프로덕션 배포를 시작합니다..."
    
    # Git push (원격 저장소 업데이트)
    git push origin main
    success "코드가 원격 저장소에 푸시되었습니다."
    
    # Vercel 배포
    vercel --prod --confirm
    success "🎉 프로덕션 배포가 완료되었습니다!"
    
    echo ""
    echo "📋 배포 후 확인사항:"
    echo "1. 배포된 사이트에 접속하여 정상 작동 확인"
    echo "2. 관리자 페이지에서 Supabase 연결 상태 확인"
    echo "3. 모든 주요 기능 테스트"
    echo "4. 모바일에서 접속 테스트"
    echo ""
    echo "🔗 배포 URL을 확인하려면 'vercel ls'를 실행하세요."
    
else
    warning "배포가 취소되었습니다."
fi

echo "✨ 스크립트 실행 완료!"
