import { createClient } from "@supabase/supabase-js"

/**
 * 브라우저에서 사용하는 Singleton Supabase 클라이언트.
 * 필수 환경 변수가 없으면 null 을 반환해 잘못된 URL 생성 오류를 방지합니다.
 */
let _supabase: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowser() {
  if (_supabase) return _supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "❌  Supabase 환경 변수가 설정되지 않았습니다. .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 를 추가해주세요.",
    )
    return null
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey)
  return _supabase
}

/** 서버 컴포넌트/Route Handlers 용 팩토리 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase 환경 변수가 없습니다. 서버 사이드에서 createServerClient() 호출 전에 환경 변수를 확인하세요.",
    )
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}
