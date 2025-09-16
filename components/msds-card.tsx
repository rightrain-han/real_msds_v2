/**
 * MSDS 카드 컴포넌트
 */

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, AlertTriangle, Shield } from 'lucide-react'
import type { MsdsItem } from '@/types/msds'
import { WarningSymbolComponent } from './warning-symbol'
import { ProtectiveEquipmentComponent } from './protective-equipment'
import { downloadPdf, openPdfInNewTab } from '@/lib/utils/msds-utils'
import { UI } from '@/lib/constants'

interface MsdsCardProps {
  item: MsdsItem
  isMobile: boolean
}

export function MsdsCard({ item, isMobile }: MsdsCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // 버튼 클릭 시에는 카드 클릭 이벤트를 무시
    if ((e.target as HTMLElement).closest('button')) {
      return
    }

    openPdfInNewTab(item)
  }

  const handlePdfDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    downloadPdf(item)
  }

  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm hover:bg-white ${
        item.pdfFileName ? 'cursor-pointer' : 'cursor-default'
      }`}
      onClick={handleCardClick}
    >
      {item.pdfFileName && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            클릭하여 PDF 보기
          </div>
        </div>
      )}
      
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
        {/* Header with MSDS Name and PDF Status */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {item.msdsCode || `M${item.id.toString().padStart(4, '0')}`}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {item.name}
              </h3>
            </div>
            {item.pdfFileName ? (
              <div className="ml-2 flex-shrink-0 flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full" title="PDF 문서 있음"></div>
                <span className="text-xs text-green-600 font-medium">PDF</span>
              </div>
            ) : (
              <div className="ml-2 flex-shrink-0 flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-300 rounded-full" title="PDF 문서 없음"></div>
                <span className="text-xs text-gray-400">없음</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              {item.usage}
            </Badge>
            {item.pdfFileName && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className={`${isMobile ? 'h-9 px-3' : 'h-7 px-2'} text-xs hover:bg-green-50`}
                  onClick={handlePdfDownload}
                >
                  <Download className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                  {isMobile && <span className="ml-1">저장</span>}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Warning Symbols Section */}
        {item.warningSymbolsData && item.warningSymbolsData.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">경고 표지</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.warningSymbolsData.map((symbol) => (
                <div key={symbol.id} className="transform hover:scale-110 transition-transform">
                  <WarningSymbolComponent symbol={symbol} size="sm" showTooltip={true} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Protective Equipment Section */}
        {item.protectiveEquipmentData && item.protectiveEquipmentData.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">보호 장구</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.protectiveEquipmentData.map((equipment) => (
                <div key={equipment.id} className="transform hover:scale-110 transition-transform">
                  <ProtectiveEquipmentComponent equipment={equipment} size="sm" showTooltip={true} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location & Laws */}
        <div className="space-y-3">
          <div>
            <span className="text-xs font-medium text-gray-600 mb-1 block">사용 장소</span>
            <div className="flex flex-wrap gap-1">
              {item.reception.slice(0, UI.MAX_RECEPTION_DISPLAY).map((rec, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs"
                >
                  {rec}
                </Badge>
              ))}
              {item.reception.length > UI.MAX_RECEPTION_DISPLAY && (
                <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                  +{item.reception.length - UI.MAX_RECEPTION_DISPLAY}개 더
                </Badge>
              )}
            </div>
          </div>

          {item.laws.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600 mb-1 block">관련 법규</span>
              <div className="flex flex-wrap gap-1">
                {item.laws.map((law, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className={`text-white text-xs ${
                      law === '화학물질안전법'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500'
                        : 'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}
                  >
                    {law}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
