"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"

interface QRCodeComponentProps {
  value: string
  size?: number
  className?: string
}

export function QRCodeComponent({ value, size = 128, className = "" }: QRCodeComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !value) return

      try {
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        })
        setError(null)
      } catch (err) {
        console.error("QR코드 생성 오류:", err)
        setError("QR코드 생성에 실패했습니다.")
      }
    }

    generateQR()
  }, [value, size])

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-red-500 text-center p-2">{error}</span>
      </div>
    )
  }

  return <canvas ref={canvasRef} className={className} />
}
