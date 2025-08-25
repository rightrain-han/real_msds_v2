import { type NextRequest, NextResponse } from "next/server"

// 초기 관리자 암호 (실제 운영에서는 환경변수나 데이터베이스에 저장)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "0000"

// 세션 만료 시간 (24시간)
const SESSION_DURATION = 24 * 60 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ success: false, error: "암호를 입력해주세요." }, { status: 400 })
    }

    // 암호 확인
    if (password !== ADMIN_PASSWORD) {
      console.log(`❌ [admin-login] 잘못된 암호 시도: ${password}`)
      return NextResponse.json({ success: false, error: "잘못된 암호입니다." }, { status: 401 })
    }

    // 세션 토큰 생성 (간단한 JWT 대신 랜덤 문자열 사용)
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)

    console.log(`✅ [admin-login] 관리자 로그인 성공`)

    // 쿠키에 세션 토큰 저장
    const response = NextResponse.json({ success: true })

    response.cookies.set("admin-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ [admin-login] 로그인 처리 중 오류:", error)
    return NextResponse.json({ success: false, error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    console.log(`🚪 [admin-login] 관리자 로그아웃`)

    const response = NextResponse.json({ success: true })

    // 세션 쿠키 삭제
    response.cookies.delete("admin-session")

    return response
  } catch (error) {
    console.error("❌ [admin-login] 로그아웃 처리 중 오류:", error)
    return NextResponse.json({ success: false, error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

/**
 * 간단한 세션 토큰 생성
 */
function generateSessionToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
