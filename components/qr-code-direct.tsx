"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"

interface QRCodeDirectProps {
  pdfUrl: string
  msdsName: string
  size?: number
  className?: string
}

/**
 * PDF 직접 연결 QR코드 컴포넌트
 * QR코드 스캔 시 MSDS 상세 페이지가 아닌 PDF 파일로 직접 연결됩니다.
 */
export function QRCodeDirect({ pdfUrl, msdsName, size = 128, className = "" }: QRCodeDirectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !pdfUrl) return

      try {
        // PDF URL을 직접 QR코드로 생성
        await QRCode.toCanvas(canvasRef.current, pdfUrl, {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "M", // 중간 수준의 오류 정정
        })
        setError(null)
      } catch (err) {
        console.error("QR코드 생성 오류:", err)
        setError("QR코드 생성에 실패했습니다.")
      }
    }

    generateQR()
  }, [pdfUrl, size])

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-red-500 text-center p-2">{error}</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} className="border border-gray-300 rounded" />
    </div>
  )
}
