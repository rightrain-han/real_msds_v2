"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle, Settings, Copy, Eye, EyeOff, Wifi, WifiOff } from "lucide-react"

/**
 * 연결 테스트 결과 인터페이스
 */
interface ConnectionResult {
  connected: boolean
  error?: string
  debug?: string
  details?: {
    url?: string
    hasServiceKey?: boolean
    status?: number
    responsePreview?: string
  }
}

/**
 * Supabase 연결 상태를 표시하고 테스트하는 컴포넌트
 * 관리자 대시보드에서 데이터베이스 연결 상태를 실시간으로 확인할 수 있습니다.
 */
export function ConnectionStatus() {
  // 연결 상태 관리
  const [connectionStatus, setConnectionStatus] = useState<ConnectionResult & { loading: boolean }>({
    connected: false,
    loading: true,
  })

  // 디버그 정보 표시 여부
  const [showDebug, setShowDebug] = useState(false)

  /**
   * Supabase 연결 테스트를 실행합니다.
   * /api/test-connection 엔드포인트를 호출하여 결과를 받아옵니다.
   */
  const checkConnection = async () => {
    setConnectionStatus((prev) => ({ ...prev, loading: true }))

    try {
      console.log("🔍 연결 테스트 시작...")

      const response = await fetch("/api/test-connection", {
        method: "GET",
        cache: "no-store", // 캐시 방지
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("🔍 연결 테스트 결과:", data)

      setConnectionStatus({
        connected: data.connected,
        error: data.error,
        debug: data.debug,
        details: data.details,
        loading: false,
      })
    } catch (error) {
      console.error("💥 클라이언트 연결 테스트 오류:", error)

      // 클라이언트 측 오류 처리
      setConnectionStatus({
        connected: false,
        error: error instanceof Error ? error.message : "연결 테스트 실패",
        debug: `클라이언트 오류: ${error}`,
        loading: false,
      })
    }
  }

  /**
   * 텍스트를 클립보드에 복사합니다.
   * 디버그 정보를 쉽게 공유할 수 있도록 합니다.
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(console.error)
  }

  // 컴포넌트 마운트 시 연결 테스트 실행 (1초 지연)
  useEffect(() => {
    const timer = setTimeout(() => {
      checkConnection()
    }, 1000)

    const interval = setInterval(checkConnection, 30000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  /**
   * 연결 상태에 따른 아이콘을 반환합니다.
   */
  const getStatusIcon = () => {
    if (connectionStatus.loading) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (connectionStatus.connected) {
      return <Wifi className="h-4 w-4 text-green-500" />
    }
    return <WifiOff className="h-4 w-4 text-red-500" />
  }

  /**
   * 연결 상태에 따른 배지를 반환합니다.
   */
  const getStatusBadge = () => {
    if (connectionStatus.loading) {
      return (
        <Badge variant="secondary" className="animate-pulse">
          <div className="w-4 h-4 mr-2 bg-gray-400 rounded-full"></div>
          연결 확인 중...
        </Badge>
      )
    }
    if (connectionStatus.connected) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 bg-opacity-90">
          데이터베이스 연결됨
        </Badge>
      )
    }
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 bg-opacity-90">
        데이터베이스 연결 실패
      </Badge>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Supabase 연결 상태
          </div>
          <div className="flex gap-2">
            {/* 디버그 정보 토글 버튼 */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDebug(!showDebug)}
              title={showDebug ? "디버그 정보 숨기기" : "디버그 정보 표시"}
            >
              {showDebug ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showDebug ? "숨기기" : "디버그"}
            </Button>

            {/* 연결 테스트 버튼 */}
            <Button
              size="sm"
              variant="outline"
              onClick={checkConnection}
              disabled={connectionStatus.loading}
              title="연결 상태 다시 확인"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${connectionStatus.loading ? "animate-spin" : ""}`} />
              테스트
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* 연결 상태 표시 */}
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusBadge()}
            {connectionStatus.details?.status && (
              <Badge variant="outline" className="text-xs">
                HTTP {connectionStatus.details.status}
              </Badge>
            )}
          </div>

          {/* 오류 정보 표시 */}
          {connectionStatus.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">연결 오류</p>
                  <p className="text-xs text-red-600 mt-1">{connectionStatus.error}</p>

                  {/* 디버그 정보 (토글 가능) */}
                  {showDebug && connectionStatus.debug && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">디버그 정보:</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(connectionStatus.debug || "")}
                          className="h-5 px-1"
                          title="디버그 정보 복사"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="whitespace-pre-wrap break-all">{connectionStatus.debug}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 성공 정보 표시 */}
          {connectionStatus.connected && connectionStatus.details && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">연결 성공!</p>
              <div className="text-xs text-green-600 mt-1 space-y-1">
                <div>URL: {connectionStatus.details.url?.substring(0, 40)}...</div>
                <div>Service Key: {connectionStatus.details.hasServiceKey ? "설정됨" : "없음"}</div>
                <div>HTTP Status: {connectionStatus.details.status}</div>

                {/* 응답 미리보기 (디버그 모드에서만) */}
                {showDebug && connectionStatus.details.responsePreview && (
                  <div className="mt-2 p-2 bg-green-100 rounded">
                    <div className="font-semibold mb-1">응답 미리보기:</div>
                    <pre className="text-xs font-mono">{connectionStatus.details.responsePreview}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 해결 방법 안내 (연결 실패 시) */}
          {!connectionStatus.connected && !connectionStatus.loading && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">해결 방법</p>
                  <div className="text-xs text-yellow-700 mt-1 space-y-2">
                    {/* Vercel 환경변수 설정 안내 */}
                    <div>
                      <p className="font-semibold">1. Vercel 환경변수 확인:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Vercel Dashboard → Settings → Environment Variables</li>
                        <li>NEXT_PUBLIC_SUPABASE_URL 설정됨</li>
                        <li>SUPABASE_SERVICE_ROLE_KEY 설정됨</li>
                        <li>환경변수 설정 후 재배포 필요</li>
                      </ul>
                    </div>

                    {/* Supabase 키 확인 안내 */}
                    <div>
                      <p className="font-semibold">2. Supabase 키 확인:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Supabase Dashboard → Settings → API</li>
                        <li>Project URL 복사 (https://xxx.supabase.co)</li>
                        <li>Service Role Key 복사 (eyJ로 시작하는 긴 문자열)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
