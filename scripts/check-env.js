/**
 * 환경변수 확인 스크립트
 * 배포 전 필수 환경변수가 설정되어 있는지 확인합니다.
 */

const fs = require("fs")
const path = require("path")

// 필수 환경변수 목록
const REQUIRED_ENV_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]

// 선택적 환경변수 목록
const OPTIONAL_ENV_VARS = ["NEXT_PUBLIC_BASE_URL"]

console.log("🔍 환경변수 확인을 시작합니다...\n")

// .env.local 파일 확인
const envLocalPath = path.join(process.cwd(), ".env.local")
const hasEnvLocal = fs.existsSync(envLocalPath)

if (hasEnvLocal) {
  console.log("✅ .env.local 파일이 존재합니다.")

  // .env.local 파일 읽기
  const envContent = fs.readFileSync(envLocalPath, "utf8")
  const envLines = envContent.split("\n").filter((line) => line.trim() && !line.startsWith("#"))

  console.log(`📄 .env.local 파일에 ${envLines.length}개의 환경변수가 설정되어 있습니다.\n`)
} else {
  console.log("⚠️  .env.local 파일이 없습니다. (프로덕션에서는 Vercel 환경변수 사용)\n")
}

// 필수 환경변수 확인
console.log("🔐 필수 환경변수 확인:")
const missingRequired = []

REQUIRED_ENV_VARS.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: 설정됨 (${value.length}자)`)

    // URL 형식 검증
    if (varName === "NEXT_PUBLIC_SUPABASE_URL") {
      if (!value.startsWith("https://") || !value.includes(".supabase.co")) {
        console.log(`   ⚠️  URL 형식이 올바르지 않을 수 있습니다.`)
      }
    }

    // Service Key 길이 검증
    if (varName === "SUPABASE_SERVICE_ROLE_KEY") {
      if (value.length < 100) {
        console.log(`   ⚠️  Service Role Key가 짧습니다. anon key와 혼동하지 않았는지 확인하세요.`)
      }
    }
  } else {
    console.log(`❌ ${varName}: 설정되지 않음`)
    missingRequired.push(varName)
  }
})

// 선택적 환경변수 확인
console.log("\n📋 선택적 환경변수 확인:")
OPTIONAL_ENV_VARS.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value}`)
  } else {
    console.log(`⚪ ${varName}: 설정되지 않음 (선택사항)`)
  }
})

// 결과 요약
console.log("\n📊 확인 결과:")
if (missingRequired.length === 0) {
  console.log("✅ 모든 필수 환경변수가 설정되어 있습니다!")
  console.log("🚀 배포를 진행할 수 있습니다.")
} else {
  console.log(`❌ ${missingRequired.length}개의 필수 환경변수가 누락되었습니다:`)
  missingRequired.forEach((varName) => {
    console.log(`   - ${varName}`)
  })
  console.log("\n🔧 해결 방법:")
  console.log("1. .env.local 파일에 누락된 환경변수 추가")
  console.log("2. 또는 Vercel Dashboard에서 환경변수 설정")
  process.exit(1)
}

console.log("\n📚 참고 문서:")
console.log("- DEPLOYMENT-GUIDE.md: 배포 가이드")
console.log("- SUPABASE-SETUP.md: Supabase 설정 가이드")
