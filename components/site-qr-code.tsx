"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"

interface SiteQRCodeProps {
  size?: number
  className?: string
}

/**
 * 사이트 접속용 QR코드 컴포넌트
 * 현재 사이트 URL을 QR코드로 생성하여 모바일 접속을 쉽게 합니다.
 */
export function SiteQRCode({ size = 120, className = "" }: SiteQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [siteUrl, setSiteUrl] = useState<string>("")

  useEffect(() => {
    // 클라이언트에서 현재 URL 가져오기
    if (typeof window !== "undefined") {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      setSiteUrl(baseUrl)
    }
  }, [])

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !siteUrl) return

      try {
        await QRCode.toCanvas(canvasRef.current, siteUrl, {
          width: size,
          margin: 2,
          color: {
            dark: "#1f2937", // 다크 그레이
            light: "#ffffff", // 화이트
          },
          errorCorrectionLevel: "M",
        })
        setError(null)
      } catch (err) {
        console.error("QR코드 생성 오류:", err)
        setError("QR코드 생성에 실패했습니다.")
      }
    }

    generateQR()
  }, [siteUrl, size])

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-red-500 text-center p-2">{error}</span>
      </div>
    )
  }

  if (!siteUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} className="border border-gray-200 rounded-lg shadow-sm" />
      <div className="text-center mt-2">
        <p className="text-xs text-gray-600">모바일로 스캔하세요</p>
      </div>
    </div>
  )
}
