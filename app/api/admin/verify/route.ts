import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("admin-session")?.value

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false })
    }

    // 실제 운영에서는 데이터베이스에서 세션 토큰 검증
    // 여기서는 단순히 토큰 존재 여부만 확인
    if (sessionToken.length === 32) {
      return NextResponse.json({ authenticated: true })
    }

    return NextResponse.json({ authenticated: false })
  } catch (error) {
    console.error("❌ [admin-verify] 세션 검증 중 오류:", error)
    return NextResponse.json({ authenticated: false })
  }
}
