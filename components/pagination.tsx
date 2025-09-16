/**
 * 페이지네이션 컴포넌트
 */

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  pageNumbers: number[]
  isMobile: boolean
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  pageNumbers,
  isMobile,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col items-center justify-center mt-12 gap-6">
      {/* Page Info */}
      <div className="text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-3 shadow-md">
          <div className="flex flex-col sm:flex-row gap-2 items-center text-sm text-gray-700">
            <span className="font-medium">
              페이지 <span className="text-blue-600">{currentPage}</span> /{' '}
              <span className="text-blue-600">{totalPages}</span>
            </span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span>
              총 <span className="font-medium text-blue-600">{totalItems}</span>개 항목
            </span>
            {isMobile && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-orange-600 font-medium">모바일 최적화</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* First Page Button (Desktop only) */}
        {!isMobile && currentPage > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            className="bg-white/80 backdrop-blur-sm"
          >
            처음
          </Button>
        )}

        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 bg-white/80 backdrop-blur-sm disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          {!isMobile && '이전'}
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`${isMobile ? 'w-10 h-10 p-0' : 'w-12 h-10 p-0'} ${
                currentPage === page
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm hover:bg-white'
              }`}
            >
              {page}
            </Button>
          ))}

          {/* Show ellipsis if there are more pages */}
          {totalPages > (isMobile ? 5 : 10) && currentPage < totalPages - (isMobile ? 2 : 4) && (
            <>
              <span className="text-gray-500 px-2">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className={`${isMobile ? 'w-10 h-10 p-0' : 'w-12 h-10 p-0'} bg-white/80 backdrop-blur-sm hover:bg-white`}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 bg-white/80 backdrop-blur-sm disabled:opacity-50"
        >
          {!isMobile && '다음'}
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page Button (Desktop only) */}
        {!isMobile && currentPage < totalPages && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="bg-white/80 backdrop-blur-sm"
          >
            마지막
          </Button>
        )}
      </div>

      {/* Mobile Usage Tip */}
      {isMobile && (
        <div className="text-center">
          <div className="bg-blue-50/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-blue-200/50">
            <p className="text-sm text-blue-800 mb-2">
              💡 <strong>사용 팁</strong>
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• 카드를 터치하면 PDF가 바로 열립니다</p>
              <p>• QR코드 스캔으로도 PDF 접근 가능</p>
              <p>• 검색으로 원하는 MSDS를 빠르게 찾으세요</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}