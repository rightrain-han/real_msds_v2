"use client"

import type React from "react"

import {
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Menu,
  Shield,
  AlertTriangle,
  FileText,
  RefreshCw,
  Download,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import type { MsdsItem, WarningSymbol, ProtectiveEquipment } from "./types/msds"
import { DEFAULT_WARNING_SYMBOLS, DEFAULT_PROTECTIVE_EQUIPMENT } from "./types/msds"
import { WarningSymbolComponent } from "./components/warning-symbol"
import { ProtectiveEquipmentComponent } from "./components/protective-equipment"

// 페이지당 항목 수 (모바일에서는 8개로 조정)
const ITEMS_PER_PAGE_DESKTOP = 12
const ITEMS_PER_PAGE_MOBILE = 8

export default function MsdsDashboard() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [msdsData, setMsdsData] = useState<MsdsItem[]>([])
  const [warningSymbols, setWarningSymbols] = useState<WarningSymbol[]>(DEFAULT_WARNING_SYMBOLS)
  const [protectiveEquipment, setProtectiveEquipment] = useState<ProtectiveEquipment[]>(DEFAULT_PROTECTIVE_EQUIPMENT)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 실시간 데이터 새로고침을 위한 interval
  useEffect(() => {
    const interval = setInterval(() => {
      loadMsdsData(false) // 로딩 상태 없이 백그라운드에서 새로고침
    }, 30000) // 30초마다 새로고침

    return () => clearInterval(interval)
  }, [])

  // MSDS 데이터 로드
  const loadMsdsData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      console.log("🔍 MSDS 데이터 로딩 시작...")

      // MSDS 데이터와 관련 정보를 병렬로 로드
      const [msdsResponse, symbolsResponse, equipmentResponse] = await Promise.all([
        fetch("/api/msds", { cache: "no-store" }),
        fetch("/api/warning-symbols", { cache: "no-store" }),
        fetch("/api/protective-equipment", { cache: "no-store" }),
      ])

      let msdsData = []
      let symbolsData = []
      let equipmentData = []

      // MSDS 데이터 처리
      if (msdsResponse.ok) {
        msdsData = await msdsResponse.json()
      } else {
        console.warn(`⚠️ /api/msds returned ${msdsResponse.status}. Falling back to /public JSON.`)
        const fallbackResponse = await fetch("/data/msds-data.json", { cache: "no-store" })
        if (fallbackResponse.ok) {
          msdsData = await fallbackResponse.json()
        }
      }

      // 경고 표지 데이터 처리
      if (symbolsResponse.ok) {
        symbolsData = await symbolsResponse.json()
      }

      // 보호 장구 데이터 처리
      if (equipmentResponse.ok) {
        equipmentData = await equipmentResponse.json()
      }

      // MSDS 데이터에 실제 경고 표지와 보호 장구 정보 매핑
      const enrichedMsdsData = msdsData.map((item) => {
        const warningSymbolsData = symbolsData.filter((symbol) => item.warningSymbols?.includes(symbol.id))
        const protectiveEquipmentData = equipmentData.filter((equipment) => item.hazards?.includes(equipment.id))

        return {
          ...item,
          warningSymbolsData,
          protectiveEquipmentData,
          pdfUrl: item.pdfUrl || item.pdf_file_url || `/pdfs/${item.pdfFileName}`,
        }
      })

      console.log("✅ MSDS 데이터 로드 성공:", enrichedMsdsData.length, "개 항목")

      setMsdsData(enrichedMsdsData)
      setWarningSymbols(symbolsData)
      setProtectiveEquipment(equipmentData)
      setError(null)
    } catch (err) {
      console.error("❌ MSDS 데이터 로딩 오류:", err)
      if (showLoading) {
        setError(err instanceof Error ? err.message : "데이터 로딩 실패")

        // 최종 fallback - 하드코딩된 샘플 데이터
        console.log("🔄 하드코딩된 샘플 데이터로 fallback")
        const sampleData = [
          {
            id: 1,
            name: "염산 35% (샘플)",
            pdfFileName: "HYDROCHLORIC_ACID.pdf",
            pdfUrl: "/pdfs/HYDROCHLORIC_ACID.pdf",
            hazards: ["toxic", "corrosive"],
            usage: "순수시약",
            reception: ["LNG 3호기 CPP", "수처리동"],
            laws: ["화학물질안전법", "산업안전보건법"],
            warningSymbols: ["corrosive", "toxic"],
          },
          {
            id: 2,
            name: "가성소다 45% (샘플)",
            pdfFileName: "SODIUM_HYDROXIDE.pdf",
            pdfUrl: "/pdfs/SODIUM_HYDROXIDE.pdf",
            hazards: ["corrosive"],
            usage: "순수시약",
            reception: ["LNG 4호기 CPP", "수처리동"],
            laws: ["화학물질안전법"],
            warningSymbols: ["corrosive"],
          },
        ]
        setMsdsData(sampleData)
      }
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    loadMsdsData()
  }, [])

  // 수동 새로고침
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadMsdsData()
    setRefreshing(false)
  }

  // PDF 다운로드 핸들러
  const handlePdfDownload = (item: MsdsItem, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const link = document.createElement("a")
    link.href = item.pdfUrl || `/pdfs/${item.pdfFileName}`
    link.download = `${item.name}.pdf`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 검색 필터링 로직
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return msdsData
    }

    const query = searchQuery.toLowerCase().trim()

    return msdsData.filter((item) => {
      // MSDS명으로 검색
      const nameMatch = item.name.toLowerCase().includes(query)

      // 용도로 검색
      const usageMatch = item.usage.toLowerCase().includes(query)

      // 장소로 검색
      const receptionMatch = item.reception.some((rec) => rec.toLowerCase().includes(query))

      // 관련법으로 검색
      const lawMatch = item.laws.some((law) => law.toLowerCase().includes(query))

      return nameMatch || usageMatch || receptionMatch || lawMatch
    })
  }, [searchQuery, msdsData])

  // 동적 페이지네이션 계산 (모바일/데스크톱 구분)
  const itemsPerPage = isMobile ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const isSearching = searchQuery.trim().length > 0

  // 현재 페이지가 총 페이지 수를 초과하는 경우 조정
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // 페이지네이션된 데이터
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [currentPage, filteredData, itemsPerPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // 페이지 변경 시 맨 위로 스크롤
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // 검색 시 첫 페이지로 이동
  }

  const clearSearch = () => {
    setSearchQuery("")
    setCurrentPage(1) // 검색어 삭제 시 첫 페이지로 이동
  }

  // 페이지 번호 생성 로직 (모바일에서는 더 간단하게)
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = isMobile ? 5 : 10

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
                <div className="text-lg font-bold text-blue-600">{totalItems}</div>
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

  // PDF 카드 클릭 핸들러
  const handleCardClick = (item: MsdsItem, e: React.MouseEvent) => {
    // 버튼 클릭 시에는 카드 클릭 이벤트를 무시
    if ((e.target as HTMLElement).closest("button")) {
      return
    }

    if (item.pdfFileName) {
      window.open(item.pdfUrl || `/pdfs/${item.pdfFileName}`, "_blank")
    }
  }

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-700 font-medium">MSDS 데이터를 불러오는 중...</p>
          <p className="text-gray-500 text-sm mt-1">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">데이터 로딩 오류</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => loadMsdsData()} className="bg-red-600 hover:bg-red-700">
            다시 시도
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
                onClick={handleRefresh}
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
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="MSDS명, 용도, 장소, 관련법으로 검색..."
                className={`w-full pl-10 pr-10 ${isMobile ? "py-4 text-base" : "py-3"} bg-white/95 backdrop-blur-sm border-white/30 text-gray-900 placeholder-gray-500 rounded-xl shadow-lg focus:ring-2 focus:ring-white/50`}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
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
                    총 {totalItems}개 문서 (페이지당 {itemsPerPage}개)
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
              <Card
                key={item.id}
                className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm hover:bg-white ${
                  item.pdfFileName ? "cursor-pointer" : "cursor-default"
                }`}
                onClick={(e) => handleCardClick(item, e)}
              >
                {item.pdfFileName && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      클릭하여 PDF 보기
                    </div>
                  </div>
                )}
                <CardContent className={`${isMobile ? "p-4" : "p-6"}`}>
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
                            className={`${isMobile ? "h-9 px-3" : "h-7 px-2"} text-xs hover:bg-green-50`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePdfDownload(item, e)
                            }}
                          >
                            <Download className={`${isMobile ? "h-4 w-4" : "h-3 w-3"}`} />
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
                        {item.reception.slice(0, 2).map((rec, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs"
                          >
                            {rec}
                          </Badge>
                        ))}
                        {item.reception.length > 2 && (
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                            +{item.reception.length - 2}개 더
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
                                law === "화학물질안전법"
                                  ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                                  : "bg-gradient-to-r from-orange-500 to-red-500"
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
                    {isSearching ? "검색 결과가 없습니다" : "데이터가 없습니다"}
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
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center mt-12 gap-6">
            {/* Page Info */}
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-3 shadow-md">
                <div className="flex flex-col sm:flex-row gap-2 items-center text-sm text-gray-700">
                  <span className="font-medium">
                    페이지 <span className="text-blue-600">{currentPage}</span> /{" "}
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
                  onClick={() => handlePageChange(1)}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  처음
                </Button>
              )}

              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 bg-white/80 backdrop-blur-sm disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {!isMobile && "이전"}
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`${isMobile ? "w-10 h-10 p-0" : "w-12 h-10 p-0"} ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "bg-white/80 backdrop-blur-sm hover:bg-white"
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
                      onClick={() => handlePageChange(totalPages)}
                      className={`${isMobile ? "w-10 h-10 p-0" : "w-12 h-10 p-0"} bg-white/80 backdrop-blur-sm hover:bg-white`}
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 bg-white/80 backdrop-blur-sm disabled:opacity-50"
              >
                {!isMobile && "다음"}
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Last Page Button (Desktop only) */}
              {!isMobile && currentPage < totalPages && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
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
        )}
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
