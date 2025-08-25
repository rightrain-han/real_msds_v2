"use client"

import { AlertCircle, Info, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UploadStatusInfo() {
  const isV0Environment = typeof window !== "undefined" && window.location.hostname.includes("v0.dev")

  if (!isV0Environment) {
    return null // 로컬 환경에서는 표시하지 않음
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          v0 환경 알림
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800">현재 v0 미리보기 환경입니다</p>
            <p className="text-blue-700">실제 PDF 파일 업로드는 로컬 환경에서만 작동합니다.</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-green-800">v0에서 확인 가능한 기능:</p>
            <ul className="text-green-700 list-disc list-inside ml-2 space-y-1">
              <li>업로드 UI 인터페이스</li>
              <li>파일 유효성 검사</li>
              <li>성공/실패 메시지</li>
              <li>관리자 페이지 기능</li>
            </ul>
          </div>
        </div>

        <div className="bg-orange-100 p-3 rounded border border-orange-200">
          <p className="text-sm text-orange-800">
            <strong>실제 테스트를 위해서는:</strong> "Download Code" 버튼을 클릭하여 로컬 환경에서 실행해주세요.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
