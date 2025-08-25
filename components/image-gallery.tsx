"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Eye, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UploadedImage {
  name: string
  url: string
  path: string
  size?: number
  uploadedAt?: string
}

interface ImageGalleryProps {
  category: "symbols" | "protective"
  onImageSelect?: (imageUrl: string) => void
  className?: string
}

export function ImageGallery({ category, onImageSelect, className = "" }: ImageGalleryProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadImages()
  }, [category])

  const loadImages = async () => {
    try {
      setLoading(true)
      // Supabase Storage에서 이미지 목록 가져오기
      const response = await fetch(`/api/images/${category}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error("Error loading images:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (imagePath: string) => {
    if (!confirm("정말로 이 이미지를 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/upload/image/delete?filePath=${encodeURIComponent(imagePath)}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setImages(images.filter((img) => img.path !== imagePath))
      } else {
        alert("이미지 삭제에 실패했습니다")
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      alert("이미지 삭제 중 오류가 발생했습니다")
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    alert("이미지 URL이 클립보드에 복사되었습니다")
  }

  const handleSelectImage = (imageUrl: string) => {
    if (onImageSelect) {
      onImageSelect(imageUrl)
    }
  }

  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">이미지를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>업로드된 이미지 ({images.length}개)</span>
            <Badge variant="outline">{category === "symbols" ? "경고 표지" : "보호 장구"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>업로드된 이미지가 없습니다</p>
              <p className="text-sm mt-1">위에서 이미지를 업로드해보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="group relative">
                  <div className="aspect-square border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:border-blue-300 transition-colors">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.name}
                      className="w-full h-full object-contain cursor-pointer"
                      onClick={() => {
                        setSelectedImage(image)
                        setShowPreview(true)
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        target.parentElement!.innerHTML =
                          '<div class="flex items-center justify-center h-full text-gray-400 text-xs">로드 실패</div>'
                      }}
                    />
                  </div>

                  {/* 호버 시 나타나는 액션 버튼들 */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedImage(image)
                        setShowPreview(true)
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleCopyUrl(image.url)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    {onImageSelect && (
                      <Button size="sm" variant="default" onClick={() => handleSelectImage(image.url)}>
                        선택
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteImage(image.path)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* 이미지 이름 */}
                  <p className="text-xs text-gray-600 mt-1 truncate" title={image.name}>
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 이미지 미리보기 모달 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>이미지 미리보기</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedImage.url || "/placeholder.svg"}
                  alt={selectedImage.name}
                  className="max-w-full max-h-96 object-contain border rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>파일명:</strong> {selectedImage.name}
                </p>
                <p className="text-sm">
                  <strong>URL:</strong>
                  <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">{selectedImage.url}</code>
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleCopyUrl(selectedImage.url)} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  URL 복사
                </Button>
                {onImageSelect && (
                  <Button
                    onClick={() => {
                      handleSelectImage(selectedImage.url)
                      setShowPreview(false)
                    }}
                    className="flex-1"
                  >
                    이 이미지 선택
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
