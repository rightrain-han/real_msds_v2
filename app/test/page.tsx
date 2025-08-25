"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { testSupabaseConnection } from "@/lib/test-supabase"

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const runConnectionTest = async () => {
    setLoading(true)
    setTestResult("테스트 실행 중...")

    // 콘솔 로그를 캡처하기 위한 배열
    const logs: string[] = []
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    console.log = (...args) => {
      logs.push(`LOG: ${args.join(" ")}`)
      originalLog(...args)
    }
    console.error = (...args) => {
      logs.push(`ERROR: ${args.join(" ")}`)
      originalError(...args)
    }
    console.warn = (...args) => {
      logs.push(`WARN: ${args.join(" ")}`)
      originalWarn(...args)
    }

    try {
      const success = await testSupabaseConnection()

      // 콘솔 복원
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn

      setTestResult(logs.join("\n") + `\n\n최종 결과: ${success ? "✅ 성공" : "❌ 실패"}`)
    } catch (error) {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn

      setTestResult(`테스트 중 오류 발생: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testAdminAPIs = async () => {
    setLoading(true)
    setTestResult("관리자 API 테스트 중...")

    try {
      const tests = []

      // 1. 경고 표지 API 테스트
      try {
        const symbolsResponse = await fetch("/api/warning-symbols")
        tests.push(`경고 표지 API: ${symbolsResponse.status} ${symbolsResponse.statusText}`)
        if (symbolsResponse.ok) {
          const symbolsData = await symbolsResponse.json()
          tests.push(`경고 표지 데이터: ${symbolsData.length}개 항목`)
        }
      } catch (error) {
        tests.push(`경고 표지 API 오류: ${error}`)
      }

      // 2. 보호 장구 API 테스트
      try {
        const equipmentResponse = await fetch("/api/protective-equipment")
        tests.push(`보호 장구 API: ${equipmentResponse.status} ${equipmentResponse.statusText}`)
        if (equipmentResponse.ok) {
          const equipmentData = await equipmentResponse.json()
          tests.push(`보호 장구 데이터: ${equipmentData.length}개 항목`)
        }
      } catch (error) {
        tests.push(`보호 장구 API 오류: ${error}`)
      }

      // 3. 설정 옵션 API 테스트
      try {
        const configResponse = await fetch("/api/config-options")
        tests.push(`설정 옵션 API: ${configResponse.status} ${configResponse.statusText}`)
        if (configResponse.ok) {
          const configData = await configResponse.json()
          tests.push(`설정 옵션 데이터: ${configData.length}개 항목`)
        }
      } catch (error) {
        tests.push(`설정 옵션 API 오류: ${error}`)
      }

      // 4. MSDS API 테스트
      try {
        const msdsResponse = await fetch("/api/msds")
        tests.push(`MSDS API: ${msdsResponse.status} ${msdsResponse.statusText}`)
        if (msdsResponse.ok) {
          const msdsData = await msdsResponse.json()
          tests.push(`MSDS 데이터: ${msdsData.length}개 항목`)
        }
      } catch (error) {
        tests.push(`MSDS API 오류: ${error}`)
      }

      setTestResult(tests.join("\n"))
    } catch (error) {
      setTestResult(`API 테스트 중 오류: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testDataInsertion = async () => {
    setLoading(true)
    setTestResult("데이터 삽입 테스트 중...")

    try {
      // 테스트 경고 표지 추가
      const testSymbol = {
        id: `test_symbol_${Date.now()}`,
        name: "테스트 경고표지",
        description: "테스트용 경고표지입니다",
        imageUrl: "/placeholder.svg",
        category: "custom",
        isActive: true,
      }

      const symbolResponse = await fetch("/api/warning-symbols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testSymbol),
      })

      if (symbolResponse.ok) {
        const symbolData = await symbolResponse.json()
        setTestResult(`✅ 테스트 경고표지 생성 성공!\n${JSON.stringify(symbolData, null, 2)}`)

        // 3초 후 삭제
        setTimeout(async () => {
          await fetch(`/api/warning-symbols/${testSymbol.id}`, { method: "DELETE" })
          setTestResult((prev) => prev + "\n\n🗑️ 테스트 데이터 정리 완료")
        }, 3000)
      } else {
        const errorData = await symbolResponse.json()
        setTestResult(`❌ 테스트 경고표지 생성 실패: ${JSON.stringify(errorData, null, 2)}`)
      }
    } catch (error) {
      setTestResult(`❌ 테스트 중 오류: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Supabase 연동 테스트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button onClick={runConnectionTest} disabled={loading} className="w-full">
                {loading ? "테스트 중..." : "🔗 연결 테스트"}
              </Button>

              <Button onClick={testAdminAPIs} disabled={loading} variant="outline" className="w-full">
                {loading ? "테스트 중..." : "🔧 관리자 API 테스트"}
              </Button>

              <Button onClick={testDataInsertion} disabled={loading} variant="outline" className="w-full">
                {loading ? "테스트 중..." : "📝 데이터 삽입 테스트"}
              </Button>

              <Button onClick={() => window.open("/admin", "_blank")} variant="secondary" className="w-full">
                🚀 관리자 페이지 열기
              </Button>
            </div>

            {testResult && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">테스트 결과:</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap max-h-96">
                  {testResult}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 환경 변수 확인</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">SUPABASE_URL:</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    process.env.NEXT_PUBLIC_SUPABASE_URL ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ 설정됨" : "❌ 설정되지 않음"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">SUPABASE_ANON_KEY:</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ 설정됨" : "❌ 설정되지 않음"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">SERVICE_ROLE_KEY:</span>
                <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">⚠️ 서버에서만 확인 가능</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔧 문제 해결 가이드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-red-600">❌ 관리자 기능이 작동하지 않는 경우:</h4>
                <ol className="list-decimal list-inside ml-4 space-y-1 mt-2">
                  <li>
                    Supabase 대시보드 → Settings → API에서 <code>service_role</code> 키 복사
                  </li>
                  <li>
                    <code>.env.local</code> 파일에 <code>SUPABASE_SERVICE_ROLE_KEY=복사한키</code> 추가
                  </li>
                  <li>
                    개발 서버 재시작: <code>npm run dev</code>
                  </li>
                  <li>위의 "관리자 API 테스트" 버튼으로 확인</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-blue-600">✅ 정상 작동 시 다음 단계:</h4>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>
                    <a href="/admin" className="text-blue-600 hover:underline">
                      관리자 페이지
                    </a>
                    에서 경고표지/보호장구 관리
                  </li>
                  <li>
                    <a href="/" className="text-blue-600 hover:underline">
                      메인 페이지
                    </a>
                    에서 데이터 조회 확인
                  </li>
                  <li>MSDS 항목 추가/수정 테스트</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
