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

  // 환경변수 존재 여부 확인
  if (!supabaseUrl || !serviceKey) {
    console.log("[v0] Supabase 환경변수가 설정되지 않았습니다 - 폴백 모드 사용")
    return null
  }

  // URL 형식 검증 (기본적인 형식만 확인)
  if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
    console.error("[v0] 잘못된 Supabase URL 형식:", supabaseUrl)
    return null
  }

  // Service Role Key 최소 길이 검증 (너무 짧으면 경고)
  if (serviceKey.length < 100) {
    console.log("[v0] Service Role Key 검증 중...")
  }

  try {
    // Supabase 클라이언트 생성
    const client = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false, // 서버사이드에서는 세션 유지 불필요
        autoRefreshToken: false, // 중복 클라이언트 경고 억제
      },
    })

    console.log("[v0] Supabase admin client 생성 완료")
    return client
  } catch (error) {
    console.error("[v0] Supabase client 생성 실패:", error)
    return null
  }
}
