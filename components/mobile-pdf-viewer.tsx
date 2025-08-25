"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, ExternalLink, X, Maximize2 } from "lucide-react"

interface MobilePdfViewerProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  msdsName: string
}

/**
 * 모바일 최적화된 PDF 뷰어 컴포넌트
 * 모바일에서 PDF를 보기 편하게 최적화된 인터페이스를 제공합니다.
 */
export function MobilePdfViewer({ isOpen, onClose, pdfUrl, msdsName }: MobilePdfViewerProps) {
  const [loading, setLoading] = useState(true)

  const handleDownload = () => {
    // PDF 다운로드
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = `${msdsName}.pdf`
    link.click()
  }

  const handleOpenExternal = () => {
    // 외부 브라우저에서 열기
    window.open(pdfUrl, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full max-h-full h-screen w-screen p-0 m-0">
        <DialogHeader className="p-4 border-b bg-white">
          <DialogTitle className="flex items-center justify-between text-sm">
            <span className="truncate flex-1 mr-2">{msdsName}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative">
          {/* PDF Embed for Mobile */}
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&page=1&view=FitH`}
            className="w-full h-full border-0"
            title={`${msdsName} PDF`}
            onLoad={() => setLoading(false)}
          />

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">PDF를 불러오는 중...</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Action Bar */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
            <Button onClick={handleOpenExternal} variant="outline" className="flex-1">
              <Maximize2 className="h-4 w-4 mr-2" />
              전체화면
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            PDF가 제대로 보이지 않으면 다운로드하거나 전체화면으로 보세요
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
