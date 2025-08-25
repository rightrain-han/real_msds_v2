"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Edit, Trash2, Upload } from "lucide-react"
import type { MsdsItem } from "../types/msds"

interface MobileAdminCardProps {
  item: MsdsItem
  onShowQR: (item: MsdsItem) => void
  onEdit: (item: MsdsItem) => void
  onDelete: (id: number) => void
  onPdfUpload: (id: number, file: File) => void
  uploading: boolean
}

export function MobileAdminCard({ item, onShowQR, onEdit, onDelete, onPdfUpload, uploading }: MobileAdminCardProps) {
  return (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.name}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-blue-500 text-white">
              {item.usage}
            </Badge>
            {item.pdfFileName && (
              <Badge variant="outline" className="text-xs">
                PDF: {item.pdfFileName}
              </Badge>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">장소:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {item.reception.map((rec, idx) => (
                <Badge key={idx} variant="secondary" className="bg-green-500 text-white text-xs">
                  {rec}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-700">관련법:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {item.laws.map((law, idx) => (
                <Badge key={idx} variant="secondary" className="bg-orange-500 text-white text-xs">
                  {law}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-600">
            <span>경고표지: {item.warningSymbols?.length || 0}개</span>
            <span>보호장구: {item.hazards?.length || 0}개</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShowQR(item)}
            className="flex items-center justify-center gap-2"
          >
            <QrCode className="h-4 w-4" />
            QR코드
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  onPdfUpload(item.id, file)
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "업로드중" : "PDF"}
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="flex items-center justify-center gap-2"
          >
            <Edit className="h-4 w-4" />
            수정
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
