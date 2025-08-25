"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, Loader2 } from "lucide-react"

interface ImageUploadProps {
  currentImageUrl?: string
  onImageChange: (imageUrl: string) => void
  category: "symbols" | "protective"
  className?: string
}

export function ImageUpload({ currentImageUrl, onImageChange, category, className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // 파일 유효성 검사
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      alert("이미지 파일만 업로드 가능합니다 (JPEG, PNG, GIF, WebP, SVG)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다")
      return
    }

    setUploading(true)

    try {
      // 미리보기 생성
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // 파일 업로드
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", category)

      console.log("📤 Uploading image:", {
        name: file.name,
        size: file.size,
        type: file.type,
        category,
      })

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const result = await response.json()
      console.log("✅ Upload successful:", result)

      // 업로드된 이미지 URL을 부모 컴포넌트에 전달
      onImageChange(result.fileUrl)
      setUploadedFilePath(result.filePath)
    } catch (error) {
      console.error("❌ Upload error:", error)
      alert(`이미지 업로드 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setUploading(false)
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = async () => {
    if (uploadedFilePath) {
      try {
        // 서버에서 이미지 삭제
        const response = await fetch(`/api/upload/image/delete?filePath=${encodeURIComponent(uploadedFilePath)}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          console.warn("Failed to delete image from server, but continuing...")
        }
      } catch (error) {
        console.warn("Error deleting image from server:", error)
      }
    }

    setPreviewUrl(null)
    setUploadedFilePath(null)
    onImageChange("")

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url)
    onImageChange(url)
    setUploadedFilePath(null) // URL 입력 시 업로드된 파일 경로 초기화
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 이미지 미리보기 */}
      {previewUrl && (
        <div className="relative inline-block">
          <div className="w-24 h-24 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-full object-contain"
              onError={(e) => {
                // 로드 실패 시 자동으로 플레이스홀더로 대체
                const img = e.currentTarget as HTMLImageElement
                img.src = "/placeholder.svg"
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* 파일 업로드 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">이미지 파일 업로드</label>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                파일 선택
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500">지원 형식: JPEG, PNG, GIF, WebP, SVG (최대 5MB)</p>
      </div>

      {/* 또는 구분선 */}
      <div className="flex items-center gap-2">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="text-xs text-gray-500 px-2">또는</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* URL 입력 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">이미지 URL 입력</label>
        <Input
          type="url"
          placeholder="https://example.com/image.png"
          value={previewUrl && !uploadedFilePath ? previewUrl : ""}
          onChange={(e) => handleUrlChange(e.target.value)}
          disabled={uploading}
        />
        <p className="text-xs text-gray-500">외부 이미지 URL을 직접 입력할 수 있습니다</p>
      </div>
    </div>
  )
}
