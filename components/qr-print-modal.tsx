"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Printer, X } from "lucide-react"
import { QRCodeComponent } from "./qr-code"
import type { MsdsItem } from "../types/msds"

interface QRPrintModalProps {
  isOpen: boolean
  onClose: () => void
  msdsItem: MsdsItem | null
}

export function QRPrintModal({ isOpen, onClose, msdsItem }: QRPrintModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  if (!msdsItem) return null

  const qrValue = `${window.location.origin}/msds/${msdsItem.id}`

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>MSDS QR코드 - ${msdsItem.name}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }
                .qr-container {
                  text-align: center;
                  border: 2px solid #000;
                  padding: 20px;
                  margin: 20px;
                  border-radius: 8px;
                }
                .qr-title {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 10px;
                }
                .qr-info {
                  font-size: 12px;
                  color: #666;
                  margin-top: 10px;
                }
                @media print {
                  body { margin: 0; }
                  .qr-container { border: 2px solid #000; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <div class="qr-title">${msdsItem.name}</div>
                ${printRef.current?.innerHTML}
                <div class="qr-info">
                  <div>ID: ${msdsItem.id}</div>
                  <div>용도: ${msdsItem.usage}</div>
                  <div>생성일: ${new Date().toLocaleDateString("ko-KR")}</div>
                </div>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const handleDownloadPNG = async () => {
    setIsGenerating(true)
    try {
      const QRCode = (await import("qrcode")).default
      const qrDataURL = await QRCode.toDataURL(qrValue, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })

      // Create a canvas with the QR code and text
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = 400
      canvas.height = 450

      // White background
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw border
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

      // Draw title
      ctx.fillStyle = "#000000"
      ctx.font = "bold 18px Arial"
      ctx.textAlign = "center"
      ctx.fillText(msdsItem.name, canvas.width / 2, 40)

      // Draw QR code
      const qrImage = new Image()
      qrImage.onload = () => {
        ctx.drawImage(qrImage, 50, 60, 300, 300)

        // Draw info
        ctx.font = "12px Arial"
        ctx.fillText(`ID: ${msdsItem.id}`, canvas.width / 2, 380)
        ctx.fillText(`용도: ${msdsItem.usage}`, canvas.width / 2, 400)
        ctx.fillText(`생성일: ${new Date().toLocaleDateString("ko-KR")}`, canvas.width / 2, 420)

        // Download
        const link = document.createElement("a")
        link.download = `MSDS_QR_${msdsItem.name}_${msdsItem.id}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
      qrImage.src = qrDataURL
    } catch (error) {
      console.error("QR코드 다운로드 오류:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            QR코드 출력 - {msdsItem.name}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Preview */}
          <div className="flex flex-col items-center space-y-4">
            <div className="border-2 border-gray-300 p-4 rounded-lg bg-white">
              <div ref={printRef}>
                <QRCodeComponent value={qrValue} size={200} />
              </div>
            </div>

            {/* Item Info */}
            <div className="text-center space-y-1">
              <div className="font-medium text-sm">{msdsItem.name}</div>
              <div className="text-xs text-gray-500">ID: {msdsItem.id}</div>
              <div className="text-xs text-gray-500">용도: {msdsItem.usage}</div>
              <div className="text-xs text-gray-500">
                URL: {window.location.origin}/msds/{msdsItem.id}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              인쇄
            </Button>
            <Button onClick={handleDownloadPNG} disabled={isGenerating} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? "생성 중..." : "PNG 다운로드"}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>• QR코드를 스캔하면 해당 MSDS 상세 정보로 이동합니다</p>
            <p>• 인쇄 시 A4 용지에 최적화되어 출력됩니다</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
