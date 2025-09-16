/**
 * MSDS 관련 유틸리티 함수들
 */

import type { MsdsItem } from '@/types/msds'
import { MSDS_CODE_FORMAT } from '@/lib/constants'

/**
 * MSDS 코드 생성 (예: M0001, M0002)
 */
export function generateMsdsCode(id: number): string {
  return `${MSDS_CODE_FORMAT.PREFIX}${id.toString().padStart(MSDS_CODE_FORMAT.PADDING, '0')}`
}

/**
 * MSDS 데이터 검색 필터링
 */
export function filterMsdsData(data: MsdsItem[], query: string): MsdsItem[] {
  if (!query.trim()) {
    return data
  }

  const searchQuery = query.toLowerCase().trim()

  return data.filter((item) => {
    // MSDS명으로 검색
    const nameMatch = item.name.toLowerCase().includes(searchQuery)
    
    // 용도로 검색
    const usageMatch = item.usage.toLowerCase().includes(searchQuery)
    
    // 장소로 검색
    const receptionMatch = item.reception.some((rec) => 
      rec.toLowerCase().includes(searchQuery)
    )
    
    // 관련법으로 검색
    const lawMatch = item.laws.some((law) => 
      law.toLowerCase().includes(searchQuery)
    )

    return nameMatch || usageMatch || receptionMatch || lawMatch
  })
}

/**
 * 페이지네이션된 데이터 반환
 */
export function getPaginatedData<T>(
  data: T[],
  currentPage: number,
  itemsPerPage: number
): T[] {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return data.slice(startIndex, endIndex)
}

/**
 * 페이지 번호 배열 생성
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number
): number[] {
  const pages: number[] = []

  if (totalPages <= maxVisiblePages) {
    // 총 페이지가 적으면 모두 표시
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // 총 페이지가 많으면 현재 페이지 기준으로 표시
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
  }

  return pages
}

/**
 * PDF 다운로드 처리
 */
export function downloadPdf(item: MsdsItem): void {
  const link = document.createElement('a')
  link.href = item.pdfUrl || `/pdfs/${item.pdfFileName}`
  link.download = `${item.name}.pdf`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * PDF 새 창에서 열기
 */
export function openPdfInNewTab(item: MsdsItem): void {
  if (item.pdfFileName) {
    window.open(item.pdfUrl || `/pdfs/${item.pdfFileName}`, '_blank')
  }
}

/**
 * 모바일 감지
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

/**
 * 스크롤을 맨 위로 이동
 */
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 파일 크기 포맷팅
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 파일 확장자 추출
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * 안전한 파일명 생성 (특수문자 제거)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9가-힣._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}
