/**
 * Supabase 연결 상태를 확인하는 유틸리티
 * 실제 REST API 엔드포인트에 요청을 보내 연결 상태를 검증합니다.
 */

interface ConnectionResult {
  success: boolean
  error?: string
  debug?: string
  data?: string
  details?: {
    url: string
    hasServiceKey: boolean
    status?: number
    responsePreview?: string
  }
}

/**
 * Supabase 연결 상태를 확인합니다.
 * 환경변수 검증 → URL 형식 검증 → 실제 REST API 호출 순으로 진행
 *
 * @returns 연결 결과 객체
 */
export async function checkSupabaseConnection(): Promise<ConnectionResult> {
  try {
    // 1. 환경변수 존재 여부 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("🔍 환경변수 확인:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: serviceKey?.length || 0,
    })

    if (!supabaseUrl) {
      return {
        success: false,
        error: "NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.",
        debug: "환경변수 누락: NEXT_PUBLIC_SUPABASE_URL",
      }
    }

    if (!serviceKey) {
      return {
        success: false,
        error: "SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다.",
        debug: "환경변수 누락: SUPABASE_SERVICE_ROLE_KEY",
      }
    }

    // 2. URL 형식 검증
    if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
      return {
        success: false,
        error: "SUPABASE_URL 형식이 올바르지 않습니다. https://your-project.supabase.co 형식이어야 합니다.",
        debug: `잘못된 URL 형식: ${supabaseUrl}`,
      }
    }

    // 3. 실제 테이블 조회로 연결 테스트 (더 안전한 방법)
    console.log("🔗 Supabase 테이블 조회 테스트 시작...")

    // msds_items 테이블에서 1개 레코드만 조회 (가장 안전한 테스트)
    const testUrl = `${supabaseUrl}/rest/v1/msds_items?select=id&limit=1`
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }

    // 타임아웃 5초로 단축
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(testUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("📨 응답 상태:", response.status)

    // 응답 본문 읽기 (에러 분석용)
    const responseText = await response.text()
    console.log("📄 응답 미리보기:", responseText.substring(0, 100))

    // 4. 성공 응답 처리 (200, 201, 204 모두 성공으로 처리)
    if (response.ok || response.status === 200) {
      console.log("✅ Supabase 연결 성공!")
      return {
        success: true,
        data: "연결 성공",
        details: {
          url: supabaseUrl,
          hasServiceKey: true,
          status: response.status,
          responsePreview: responseText.substring(0, 100),
        },
      }
    }

    // 5. 에러 응답 처리 (상태코드별 맞춤 메시지)
    let errorMessage = `HTTP ${response.status} - Supabase 연결 실패`
    let debugInfo = `Status: ${response.status}, Response: ${responseText.substring(0, 100)}`

    switch (response.status) {
      case 401:
        errorMessage = "인증 실패: Service Role Key가 올바르지 않습니다."
        debugInfo += " | 401 Unauthorized - API 키 확인 필요"
        break
      case 403:
        errorMessage = "권한 없음: Service Role Key에 필요한 권한이 없습니다."
        debugInfo += " | 403 Forbidden - 권한 설정 확인 필요"
        break
      case 404:
        // 404는 테이블이 없을 수 있으므로 경고로 처리하되 연결은 성공으로 간주
        console.log("⚠️ 테이블이 없지만 연결은 성공")
        return {
          success: true,
          data: "연결 성공 (테이블 없음)",
          details: {
            url: supabaseUrl,
            hasServiceKey: true,
            status: response.status,
            responsePreview: "테이블이 아직 생성되지 않았습니다.",
          },
        }
      case 500:
      case 502:
      case 503:
        errorMessage = "Supabase 서버 오류: 잠시 후 다시 시도해주세요."
        debugInfo += " | 5xx Server Error - Supabase 서버 문제"
        break
    }

    return {
      success: false,
      error: errorMessage,
      debug: debugInfo,
    }
  } catch (error) {
    console.error("💥 연결 테스트 중 오류 발생:", error)

    let errorMessage = "알 수 없는 연결 오류"
    let debugInfo = ""

    if (error instanceof Error) {
      errorMessage = error.message
      debugInfo = error.stack || error.message

      // 특정 오류 타입별 처리
      if (error.name === "AbortError") {
        errorMessage = "연결 시간 초과: Supabase 응답이 너무 느립니다."
        debugInfo += " | Timeout Error"
      } else if (error.message.includes("fetch") || error.message.includes("network")) {
        errorMessage = "네트워크 오류: Supabase에 연결할 수 없습니다."
        debugInfo += " | Network/Fetch Error"
      }
    }

    return {
      success: false,
      error: errorMessage,
      debug: debugInfo,
    }
  }
}
