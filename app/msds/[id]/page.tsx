import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Download } from "lucide-react"
import type { MsdsItem } from "../../../types/msds"

// 실제 환경에서는 데이터베이스에서 가져와야 합니다
async function getMsdsItem(id: string): Promise<MsdsItem | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/msds`, {
      cache: "no-store",
    })
    if (!response.ok) return null

    const items: MsdsItem[] = await response.json()
    return items.find((item) => item.id === Number.parseInt(id)) || null
  } catch (error) {
    console.error("Error fetching MSDS item:", error)
    return null
  }
}

export default async function MsdsDetailPage({ params }: { params: { id: string } }) {
  const item = await getMsdsItem(params.id)

  if (!item) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">MSDS 상세정보</h1>
          </div>
          {item.pdfFileName && (
            <a href={`/pdfs/${item.pdfFileName}`} target="_blank" rel="noopener noreferrer">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                PDF 다운로드
              </Button>
            </a>
          )}
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">ID</label>
                  <p className="text-lg">{item.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">용도</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-blue-500 text-white">
                      {item.usage}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">장소</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.reception.map((rec, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-green-500 text-white">
                        {rec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">관련법</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.laws.map((law, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className={`text-white ${law === "화학물질안전법" ? "bg-teal-500" : "bg-orange-500"}`}
                      >
                        {law}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning Symbols */}
            {item.warningSymbols && item.warningSymbols.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>경고 표지</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {item.warningSymbols.map((symbolId) => (
                      <div key={symbolId} className="text-center">
                        {/* Warning symbol component would go here */}
                        <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-2"></div>
                        <p className="text-xs text-gray-600">{symbolId}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Protective Equipment */}
            {item.hazards && item.hazards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>보호장구</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {item.hazards.map((hazardId) => (
                      <div key={hazardId} className="text-center">
                        {/* Protective equipment component would go here */}
                        <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-2"></div>
                        <p className="text-xs text-gray-600">{hazardId}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* PDF Info */}
            {item.pdfFileName && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">PDF 문서</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="font-medium text-sm">{item.pdfFileName}</p>
                      <a
                        href={`/pdfs/${item.pdfFileName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        PDF 열기 →
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* QR Code Access Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QR 코드 접근</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">이 페이지는 QR 코드를 통해 접근되었습니다.</p>
                <div className="text-xs text-gray-500">
                  <p>• 모바일에서 QR 코드 스캔</p>
                  <p>• 즉시 MSDS 정보 확인</p>
                  <p>• PDF 다운로드 가능</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
