"use client"

import React, { useState, useMemo } from "react"
import { Menu, Shield, AlertTriangle, FileText, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import type { MsdsItem } from "./types/msds"
import { useMsdsData } from "./hooks/use-msds-data"
import { usePagination } from "./hooks/use-pagination"
import { useMobile } from "./hooks/use-mobile"
import { filterMsdsData } from "./lib/utils/msds-utils"
import { MsdsCard } from "./components/msds-card"
import { SearchBar } from "./components/search-bar"
import { Pagination } from "./components/pagination"
import { MESSAGES } from "./lib/constants"

export default function MsdsDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // 커스텀 훅 사용
  const isMobile = useMobile()
  const { msdsData, loading, refreshing, error, refresh } = useMsdsData()

  // 검색 필터링
  const filteredData = useMemo(() => {
    return filterMsdsData(msdsData, searchQuery)
  }, [searchQuery, msdsData])

  // 페이지네이션
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData,
    pageNumbers,
    handlePageChange,
    resetToFirstPage,
  } = usePagination({ data: filteredData, isMobile })

  // 검색어 변경 시 첫 페이지로 이동
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    resetToFirstPage()
  }

  const clearSearch = () => {
    setSearchQuery("")
    resetToFirstPage()
  }

  const isSearching = searchQuery.trim().length > 0

  // 모바일 메뉴 컴포넌트
  const MobileMenu = () => (
    <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <h3 className="font-semibold">빠른 메뉴</h3>
            <Link href="/admin" onClick={() => setShowMobileMenu(false)}>
              <Button variant="outline" className="w-full justify-start">
                관리자 페이지
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">통계</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{filteredData.length}</div>
                <div className="text-xs text-blue-800">총 항목</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{totalPages}</div>
                <div className="text-xs text-green-800">총 페이지</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">사용법</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• QR코드를 스캔하면 PDF가 바로 열립니다</p>
              <p>• 검색으로 원하는 MSDS를 찾을 수 있습니다</p>
              <p>• 경고표지와 보호장구를 확인하세요</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-700 font-medium">{MESSAGES.LOADING}</p>
          <p className="text-gray-500 text-sm mt-1">{MESSAGES.LOADING_SUBTITLE}</p>
        </div>
      </div>
    )
  }

  // 오류 발생 시
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{MESSAGES.ERROR_TITLE}</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refresh} className="bg-red-600 hover:bg-red-700">
            {MESSAGES.RETRY_BUTTON}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="px-4 md:px-6 py-6 md:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">MSDS 안전관리시스템</h1>
                <p className="text-blue-100 text-sm md:text-base">Material Safety Data Sheet</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                onClick={refresh}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                새로고침
              </Button>
              <Link href="/admin">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  관리자 페이지
                </Button>
              </Link>
            </div>

            {/* Mobile Menu */}
            <MobileMenu />
          </div>

          {/* Enhanced Search Bar */}
          <div className="mt-6">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClearSearch={clearSearch}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Status Bar */}
      <div
        className={`px-4 md:px-6 py-4 border-b ${isSearching ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-100 rounded">
                  <Search className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-800 font-medium">
                    검색: <strong>"{searchQuery}"</strong>
                  </p>
                  <p className="text-xs text-emerald-700">
                    {filteredData.length}개 결과 발견
                    {filteredData.length === 0 && " - 다른 검색어를 시도해보세요"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    페이지 <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
                  </p>
                  <p className="text-xs text-blue-700">
                    총 {filteredData.length}개 문서 (페이지당 {itemsPerPage}개)
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-600">
            {isMobile && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">📱 모바일 최적화</span>}
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="p-4 md:p-6">
        {/* Grid Layout for Better Visual Appeal */}
        <div
          className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}
        >
          {paginatedData.length > 0 ? (
            paginatedData.map((item) => (
              <MsdsCard key={item.id} item={item} isMobile={isMobile} />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-16">
                  <div className="mb-4">
                    {isSearching ? (
                      <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    ) : (
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {isSearching ? MESSAGES.NO_RESULTS : MESSAGES.NO_DATA}
                  </h3>
                  {isSearching && (
                    <p className="text-gray-600 mb-4">
                      "<strong>{searchQuery}</strong>"에 대한 검색 결과를 찾을 수 없습니다
                    </p>
                  )}
                  <p className="text-gray-500">
                    {isSearching ? "다른 검색어를 시도해보세요" : "등록된 MSDS 문서가 없습니다"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Enhanced Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          pageNumbers={pageNumbers}
          isMobile={isMobile}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Enhanced Footer */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white mt-16">
        <div className="px-4 md:px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold">MSDS 안전관리시스템</span>
            </div>
            <p className="text-gray-300 mb-2">Copyright © GS EPS Digital Transformation Team</p>
            {isMobile && <p className="text-gray-400 text-sm">모바일 최적화 버전</p>}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400">Material Safety Data Sheet Management System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
