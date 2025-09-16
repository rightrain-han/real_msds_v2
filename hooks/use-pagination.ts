/**
 * 페이지네이션 관리 커스텀 훅
 */

import { useState, useEffect, useMemo } from 'react'
import { PAGINATION, UI } from '@/lib/constants'
import { getPaginatedData, generatePageNumbers } from '@/lib/utils/msds-utils'

interface UsePaginationProps<T> {
  data: T[]
  isMobile: boolean
}

interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  paginatedData: T[]
  pageNumbers: number[]
  handlePageChange: (page: number) => void
  resetToFirstPage: () => void
}

export function usePagination<T>({ data, isMobile }: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1)
  
  // 동적 페이지네이션 계산 (모바일/데스크톱 구분)
  const itemsPerPage = isMobile ? PAGINATION.ITEMS_PER_PAGE_MOBILE : PAGINATION.ITEMS_PER_PAGE_DESKTOP
  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  // 현재 페이지가 총 페이지 수를 초과하는 경우 조정
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])
  
  // 페이지네이션된 데이터
  const paginatedData = useMemo(() => {
    return getPaginatedData(data, currentPage, itemsPerPage)
  }, [data, currentPage, itemsPerPage])
  
  // 페이지 번호 생성
  const pageNumbers = useMemo(() => {
    const maxVisiblePages = isMobile ? UI.MAX_VISIBLE_PAGES_MOBILE : UI.MAX_VISIBLE_PAGES_DESKTOP
    return generatePageNumbers(currentPage, totalPages, maxVisiblePages)
  }, [currentPage, totalPages, isMobile])
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // 페이지 변경 시 맨 위로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  const resetToFirstPage = () => {
    setCurrentPage(1)
  }
  
  return {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData,
    pageNumbers,
    handlePageChange,
    resetToFirstPage,
  }
}
