"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      // API 상태 확인
      const apiResponse = await fetch("/api/msds")
      const apiData = await apiResponse.json()

      // JSON 파일 상태 확인
      const jsonResponse = await fetch("/data/msds-data.json")
      const jsonData = await jsonResponse.json()

      // 환경 변수 확인
      const envInfo = {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }

      setDebugInfo({
        api: {
          status: apiResponse.status,
          dataCount: Array.isArray(apiData) ? apiData.length : 0,
          firstItem: apiData[0] || null,
        },
        json: {
          status: jsonResponse.status,
          dataCount: Array.isArray(jsonData) ? jsonData.length : 0,
          firstItem: jsonData[0] || null,
        },
        env: envInfo,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🔍 디버그 정보
          <Button onClick={checkStatus} disabled={loading} size="sm">
            {loading ? "확인 중..." : "새로고침"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {debugInfo ? (
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        ) : (
          <p>로딩 중...</p>
        )}
      </CardContent>
    </Card>
  )
}
