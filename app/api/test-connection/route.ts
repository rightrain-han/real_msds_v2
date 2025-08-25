import { NextResponse } from "next/server"
import { checkSupabaseConnection } from "@/lib/supabase-admin-check"

/**
 * Supabase 연결 상태를 테스트하는 API 엔드포인트
 * GET /api/test-connection
 */
export async function GET() {
  try {
    console.log("🔍 서버 연결 테스트 시작...")

    // Supabase 연결 상태 확인
    const result = await checkSupabaseConnection()

    console.log("🔍 서버 연결 테스트 결과:", result)

    if (!result.success) {
      console.error("❌ 연결 테스트 실패:", result.error)

      // 실패 시에도 200 상태로 응답 (클라이언트에서 에러 정보를 받을 수 있도록)
      return NextResponse.json({
        connected: false,
        error: result.error,
        debug: result.debug,
      })
    }

    console.log("✅ 연결 테스트 성공")

    // 성공 응답
    return NextResponse.json({
      connected: true,
      message: "Supabase 연결 성공",
      details: result.details,
    })
  } catch (error) {
    console.error("💥 연결 테스트 중 예외 발생:", error)

    // 예외 발생 시에도 200 상태로 응답 (더 안전한 처리)
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      debug: error instanceof Error ? error.stack : "Unknown error",
    })
  }
}
