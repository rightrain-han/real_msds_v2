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
    console.warn("⚠️ Supabase 환경변수가 설정되지 않았습니다:", {
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: !!serviceKey,
    })
    return null
  }

  // URL 형식 검증 (기본적인 형식만 확인)
  if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
    console.error("❌ 잘못된 Supabase URL 형식:", supabaseUrl)
    return null
  }

  // Service Role Key 최소 길이 검증 (너무 짧으면 경고)
  if (serviceKey.length < 40) {
    console.warn("⚠️ Service Role Key가 예상보다 짧습니다. anon key와 혼동하지 않았는지 확인하세요.")
  }

  try {
    // Supabase 클라이언트 생성
    const client = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false, // 서버사이드에서는 세션 유지 불필요
      },
    })

    console.log("✅ Supabase admin client 생성 완료")
    return client
  } catch (error) {
    console.error("❌ Supabase client 생성 실패:", error)
    return null
  }
}
