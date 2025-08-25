"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { QrCode } from "lucide-react"
import QRCode from "qrcode"
import { useEffect } from "react"

interface QRCodeDirectProps {
  msdsId?: string
  className?: string
}

export function QRCodeDirect({ msdsId, className }: QRCodeDirectProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)

  const generateQRCode = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      const url = msdsId ? `${baseUrl}/msds/${msdsId}` : baseUrl
      const qrUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error("QR 코드 생성 실패:", error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      generateQRCode()
    }
  }, [isOpen, msdsId])

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow && qrCodeUrl) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      const url = msdsId ? `${baseUrl}/msds/${msdsId}` : baseUrl

      printWindow.document.write(`
        <html>
          <head>
            <title>QR 코드 인쇄</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
              }
              .qr-container { 
                display: inline-block; 
                border: 2px solid #000; 
                padding: 20px; 
                margin: 20px; 
              }
              .qr-title { 
                font-size: 18px; 
                font-weight: bold; 
                margin-bottom: 10px; 
              }
              .qr-url { 
                font-size: 12px; 
                color: #666; 
                margin-top: 10px; 
                word-break: break-all; 
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-title">MSDS 시스템 ${msdsId ? `- 항목 ${msdsId}` : ""}</div>
              <img src="${qrCodeUrl}" alt="QR Code" />
              <div class="qr-url">${url}</div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <QrCode className="h-4 w-4" />
          {msdsId ? "" : "QR 코드"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR 코드 {msdsId ? `- 항목 ${msdsId}` : ""}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {qrCodeUrl && (
            <div className="border-2 border-gray-200 p-4 rounded-lg">
              <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-64 h-64" />
            </div>
          )}
          <div className="text-sm text-gray-600 text-center">
            <p>이 QR 코드를 스캔하면</p>
            <p className="font-medium">{msdsId ? `해당 MSDS 상세 페이지로` : "MSDS 시스템 메인 페이지로"} 이동합니다</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline">
              인쇄하기
            </Button>
            <Button onClick={() => setIsOpen(false)}>닫기</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
