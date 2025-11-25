import { createClient } from "@supabase/supabase-js"

/**
 * Supabase Admin 클라이언트를 생성합니다.
 * Service Role Key를 사용하여 모든 테이블에 대한 읽기/쓰기 권한을 가집니다.
 *
 * @returns Supabase 클라이언트 인스턴스 또는 null (환경변수 누락 시)
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log("[v0] 🔍 환경 변수 상세 확인:")
  console.log(
    "[v0] - NEXT_PUBLIC_SUPABASE_URL:",
    supabaseUrl ? `설정됨 (${supabaseUrl.substring(0, 30)}...)` : "❌ 없음",
  )
  if (serviceKey) {
    console.log(`[v0] - SUPABASE_SERVICE_ROLE_KEY: 설정됨 (길이: ${serviceKey.length})`)
    console.log(`[v0]   키 시작: "${serviceKey.substring(0, 10)}..."`)
    console.log(`[v0]   키 끝: "...${serviceKey.substring(serviceKey.length - 10)}"`)
  } else {
    console.log("[v0] - SUPABASE_SERVICE_ROLE_KEY: ❌ 없음")
  }

  // 환경변수 존재 여부 확인
  if (!supabaseUrl || !serviceKey) {
    console.log("[v0] ⚠️ Supabase 환경변수가 설정되지 않았습니다 - 폴백 모드 사용")
    console.log("[v0] 💡 v0 UI의 'Vars' 섹션에서 환경 변수를 설정한 후 페이지를 새로고침하세요")
    return null
  }

  // URL 형식 검증 (기본적인 형식만 확인)
  if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
    console.error("[v0] ❌ 잘못된 Supabase URL 형식:", supabaseUrl)
    return null
  }

  // Service Role Key 형식 검증
  const isNewFormat = serviceKey.startsWith("sb_secret_")
  const isLegacyFormat = serviceKey.startsWith("eyJ")

  if (!isNewFormat && !isLegacyFormat) {
    console.error("[v0] ❌ Service Role Key 형식이 올바르지 않습니다.")
    console.error("[v0]    'sb_secret_'로 시작하거나 'eyJ'로 시작해야 합니다.")
    return null
  }

  if (isNewFormat && serviceKey.length < 40) {
    console.error("[v0] ❌ Service Role Key가 너무 짧습니다. 전체 키를 복사했는지 확인하세요.")
    return null
  }

  if (isLegacyFormat && serviceKey.length < 100) {
    console.error("[v0] ❌ Service Role Key가 너무 짧습니다. 전체 JWT 토큰을 복사했는지 확인하세요.")
    return null
  }

  try {
    // Supabase 클라이언트 생성
    const client = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false, // 서버사이드에서는 세션 유지 불필요
        autoRefreshToken: false, // 중복 클라이언트 경고 억제
      },
    })

    console.log("[v0] ✅ Supabase admin client 생성 완료")
    return client
  } catch (error) {
    console.error("[v0] ❌ Supabase client 생성 실패:", error)
    return null
  }
}
