"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Upload, QrCode, LogOut } from "lucide-react"
import Link from "next/link"
import type { MsdsItem, WarningSymbol, ProtectiveEquipment } from "./types/msds"
import { QRPrintModal } from "./components/qr-print-modal"
import { ImageUpload } from "./components/image-upload"
import { UploadStatusInfo } from "./components/upload-status-info"

interface AdminDashboardProps {
  onLogout?: () => void
}

interface FormData {
  id?: number
  name: string
  pdfFileName: string
  pdfUrl: string
  hazards: string[]
  usage: string
  reception: string[]
  laws: string[]
  warningSymbols: string[]
}

interface ConfigOption {
  id: number
  type: string
  value: string
  label: string
  is_active: boolean
}

const initialFormData: FormData = {
  name: "",
  pdfFileName: "",
  pdfUrl: "",
  hazards: [],
  usage: "",
  reception: [],
  laws: [],
  warningSymbols: [],
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [msdsItems, setMsdsItems] = useState<MsdsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<MsdsItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // QR코드 관리 상태
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedQRItem, setSelectedQRItem] = useState<MsdsItem | null>(null)

  // 관리 데이터 상태
  const [warningSymbols, setWarningSymbols] = useState<WarningSymbol[]>([])
  const [protectiveEquipment, setProtectiveEquipment] = useState<ProtectiveEquipment[]>([])
  const [configOptions, setConfigOptions] = useState<ConfigOption[]>([])

  // 편집 상태
  const [editingSymbol, setEditingSymbol] = useState<WarningSymbol | null>(null)
  const [showSymbolForm, setShowSymbolForm] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<ProtectiveEquipment | null>(null)
  const [showEquipmentForm, setShowEquipmentForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ConfigOption | null>(null)
  const [showConfigForm, setShowConfigForm] = useState(false)

  // 폼 데이터
  const [symbolFormData, setSymbolFormData] = useState({
    id: "",
    name: "",
    description: "",
    category: "physical",
    imageUrl: "",
  })

  const [equipmentFormData, setEquipmentFormData] = useState({
    id: "",
    name: "",
    description: "",
    category: "respiratory",
    imageUrl: "",
  })

  const [configFormData, setConfigFormData] = useState({
    type: "usage",
    value: "",
    label: "",
  })

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    await Promise.all([loadMsdsItems(), loadWarningSymbols(), loadProtectiveEquipment(), loadConfigOptions()])
  }

  // 로그아웃 처리
  const handleLogout = () => {
    if (confirm("정말로 로그아웃하시겠습니까?")) {
      onLogout?.()
    }
  }

  const loadMsdsItems = async () => {
    try {
      setLoading(true)

      console.log("📡 [admin] GET /api/msds")
      let res = await fetch("/api/msds", { cache: "no-store" })

      if (!res.ok) {
        console.warn(`⚠️  /api/msds → ${res.status}. Fallback to /data/msds-data.json`)
        res = await fetch("/data/msds-data.json", { cache: "no-store" })
      }

      if (!res.ok) {
        throw new Error(`Fallback JSON also failed (${res.status})`)
      }

      const text = await res.text()
      let json: MsdsItem[]
      try {
        json = JSON.parse(text)
      } catch (e) {
        console.error("❌ JSON parse error:", e)
        throw new Error("Invalid JSON structure")
      }

      if (!Array.isArray(json)) {
        throw new Error("JSON is not an array")
      }

      console.log("✅ [admin] MSDS items loaded:", json.length)
      setMsdsItems(json)
    } catch (err) {
      console.error("Error loading MSDS items:", err)

      // Hard-coded 2-item sample so UI can still render
      setMsdsItems([
        {
          id: 1,
          name: "염산 35% (샘플)",
          pdfFileName: "HYDROCHLORIC_ACID.pdf",
          pdfUrl: "/pdfs/HYDROCHLORIC_ACID.pdf",
          hazards: ["corrosive", "toxic"],
          usage: "순수시약",
          reception: ["LNG 3호기 CPP"],
          laws: ["화학물질안전법"],
          warningSymbols: ["corrosive", "toxic"],
          qrCode: "",
        },
        {
          id: 2,
          name: "가성소다 45% (샘플)",
          pdfFileName: "SODIUM_HYDROXIDE.pdf",
          pdfUrl: "/pdfs/SODIUM_HYDROXIDE.pdf",
          hazards: ["corrosive"],
          usage: "순수시약",
          reception: ["수처리동"],
          laws: ["산업안전보건법"],
          warningSymbols: ["corrosive"],
          qrCode: "",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadWarningSymbols = async () => {
    try {
      const response = await fetch("/api/warning-symbols")
      if (response.ok) {
        const data = await response.json()
        setWarningSymbols(data)
      }
    } catch (error) {
      console.error("Error loading warning symbols:", error)
    }
  }

  const loadProtectiveEquipment = async () => {
    try {
      const response = await fetch("/api/protective-equipment")
      if (response.ok) {
        const data = await response.json()
        setProtectiveEquipment(data)
      }
    } catch (error) {
      console.error("Error loading protective equipment:", error)
    }
  }

  const loadConfigOptions = async () => {
    try {
      console.log("🔧 [admin] Loading config options...")
      const response = await fetch("/api/config-options", { cache: "no-store" })

      console.log("🔧 [admin] Config options response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("🔧 [admin] Config options loaded:", data.length, "items")
        console.log("🔧 [admin] Config options data:", data)
        setConfigOptions(data)
      } else {
        console.error("🔧 [admin] Config options API failed:", response.status, response.statusText)
        // 기본 데이터로 폴백
        const defaultConfig = [
          { id: 1, type: "usage", value: "pure_reagent", label: "순수시약", is_active: true },
          { id: 2, type: "usage", value: "nox_reduction", label: "NOx저감", is_active: true },
          { id: 3, type: "reception", value: "lng_3_cpp", label: "LNG 3호기 CPP", is_active: true },
          { id: 4, type: "reception", value: "water_treatment", label: "수처리동", is_active: true },
          { id: 5, type: "laws", value: "chemical_safety", label: "화학물질안전법", is_active: true },
          { id: 6, type: "laws", value: "industrial_safety", label: "산업안전보건법", is_active: true },
        ]
        console.log("🔧 [admin] Using fallback config data")
        setConfigOptions(defaultConfig)
      }
    } catch (error) {
      console.error("🔧 [admin] Error loading config options:", error)
      // 에러 발생 시에도 기본 데이터 제공
      const defaultConfig = [
        { id: 1, type: "usage", value: "pure_reagent", label: "순수시약", is_active: true },
        { id: 2, type: "usage", value: "nox_reduction", label: "NOx저감", is_active: true },
        { id: 3, type: "reception", value: "lng_3_cpp", label: "LNG 3호기 CPP", is_active: true },
        { id: 4, type: "reception", value: "water_treatment", label: "수처리동", is_active: true },
        { id: 5, type: "laws", value: "chemical_safety", label: "화학물질안전법", is_active: true },
        { id: 6, type: "laws", value: "industrial_safety", label: "산업안전보건법", is_active: true },
      ]
      setConfigOptions(defaultConfig)
    }
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  // PDF 업로드 함수
  const handlePdfUpload = async (msdsId: number, file: File) => {
    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("msdsId", msdsId.toString())

      const response = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "업로드 실패")
      }

      const result = await response.json()
      showMessage("success", `PDF 업로드 성공: ${result.fileName}`)

      // MSDS 목록 새로고침
      await loadMsdsItems()
    } catch (error) {
      console.error("PDF 업로드 오류:", error)
      showMessage("error", `PDF 업로드 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setUploading(false)
    }
  }

  // QR 코드 관련 함수들
  const handleShowQR = (item: MsdsItem) => {
    setSelectedQRItem(item)
    setShowQRModal(true)
  }

  // MSDS 관리 함수들
  const handleEdit = (item: MsdsItem) => {
    setEditingItem(item)
    setFormData({
      id: item.id,
      name: item.name,
      pdfFileName: item.pdfFileName || "",
      pdfUrl: item.pdfUrl || "",
      hazards: item.hazards,
      usage: item.usage,
      reception: item.reception,
      laws: item.laws,
      warningSymbols: item.warningSymbols || [],
    })
    setShowAddForm(false)
  }

  const handleAdd = () => {
    setShowAddForm(true)
    setEditingItem(null)
    setFormData(initialFormData)
  }

  const handleSave = async () => {
    try {
      setSubmitting(true)

      if (!formData.name.trim()) {
        showMessage("error", "MSDS명을 입력해주세요.")
        return
      }

      const submitData = {
        name: formData.name,
        pdfFileName: formData.pdfFileName,
        pdfUrl: formData.pdfUrl,
        hazards: formData.hazards,
        usage: formData.usage,
        reception: formData.reception,
        laws: formData.laws,
        warningSymbols: formData.warningSymbols,
      }

      let response
      if (editingItem) {
        response = await fetch(`/api/msds/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        })
      } else {
        response = await fetch("/api/msds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "저장 실패")
      }

      await loadMsdsItems()
      setShowAddForm(false)
      setEditingItem(null)
      setFormData(initialFormData)
      showMessage("success", editingItem ? "MSDS 항목이 수정되었습니다." : "MSDS 항목이 추가되었습니다.")
    } catch (error) {
      console.error("저장 오류:", error)
      showMessage("error", `저장 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 MSDS 항목을 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/msds/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("삭제 실패")

      await loadMsdsItems()
      showMessage("success", "MSDS 항목이 삭제되었습니다.")
    } catch (error) {
      console.error("삭제 오류:", error)
      showMessage("error", "삭제 중 오류가 발생했습니다.")
    }
  }

  // 경고 표지 관리 함수들
  const handleSaveSymbol = async () => {
    try {
      if (!symbolFormData.name.trim()) {
        showMessage("error", "경고 표지 이름을 입력해주세요.")
        return
      }

      const submitData = {
        id: symbolFormData.id || `symbol_${Date.now()}`,
        name: symbolFormData.name,
        description: symbolFormData.description,
        imageUrl: symbolFormData.imageUrl || "/placeholder.svg",
        category: symbolFormData.category,
        isActive: true,
      }

      let response
      if (editingSymbol) {
        response = await fetch(`/api/warning-symbols/${editingSymbol.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        })
      } else {
        response = await fetch("/api/warning-symbols", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        })
      }

      if (!response.ok) throw new Error("Failed to save warning symbol")

      await loadWarningSymbols()
      setShowSymbolForm(false)
      setEditingSymbol(null)
      setSymbolFormData({ id: "", name: "", description: "", category: "physical", imageUrl: "" })
      showMessage("success", editingSymbol ? "경고 표지가 수정되었습니다." : "경고 표지가 추가되었습니다.")
    } catch (error) {
      console.error("Error saving symbol:", error)
      showMessage("error", "경고 표지 저장 중 오류가 발생했습니다.")
    }
  }

  const handleDeleteSymbol = async (id: string) => {
    if (!confirm("정말로 이 경고 표지를 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/warning-symbols/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete warning symbol")

      await loadWarningSymbols()
      await loadMsdsItems()
      showMessage("success", "경고 표지가 삭제되었습니다.")
    } catch (error) {
      console.error("Error deleting symbol:", error)
      showMessage("error", "경고 표지 삭제 중 오류가 발생했습니다.")
    }
  }

  // 보호 장구 관리 함수들
  const handleSaveEquipment = async () => {
    try {
      if (!equipmentFormData.name.trim()) {
        showMessage("error", "보호 장구 이름을 입력해주세요.")
        return
      }

      const submitData = {
        id: equipmentFormData.id || `equipment_${Date.now()}`,
        name: equipmentFormData.name,
        description: equipmentFormData.description,
        imageUrl: equipmentFormData.imageUrl || "/placeholder.svg",
        category: equipmentFormData.category,
        isActive: true,
      }

      let response
      if (editingEquipment) {
        response = await fetch(`/api/protective-equipment/${editingEquipment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        })
      } else {
        response = await fetch("/api/protective-equipment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        })
      }

      if (!response.ok) throw new Error("Failed to save protective equipment")

      await loadProtectiveEquipment()
      setShowEquipmentForm(false)
      setEditingEquipment(null)
      setEquipmentFormData({ id: "", name: "", description: "", category: "respiratory", imageUrl: "" })
      showMessage("success", editingEquipment ? "보호 장구가 수정되었습니다." : "보호 장구가 추가되었습니다.")
    } catch (error) {
      console.error("Error saving equipment:", error)
      showMessage("error", "보호 장구 저장 중 오류가 발생했습니다.")
    }
  }

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm("정말로 이 보호 장구를 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/protective-equipment/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete protective equipment")

      await loadProtectiveEquipment()
      await loadMsdsItems()
      showMessage("success", "보호 장구가 삭제되었습니다.")
    } catch (error) {
      console.error("Error deleting equipment:", error)
      showMessage("error", "보호 장구 삭제 중 오류가 발생했습니다.")
    }
  }

  // 설정 관리 함수들
  const handleSaveConfig = async () => {
    try {
      if (!configFormData.label.trim()) {
        showMessage("error", "설정 항목 이름을 입력해주세요.")
        return
      }

      const submitData = {
        type: configFormData.type,
        value: configFormData.value || configFormData.label.toLowerCase().replace(/\s+/g, "_"),
        label: configFormData.label,
        isActive: true,
      }

      let response
      if (editingConfig) {
        response = await fetch(`/api/config-options/${editingConfig.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        })
      } else {
        response = await fetch("/api/config-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        })
      }

      if (!response.ok) throw new Error("Failed to save config option")

      await loadConfigOptions()
      setShowConfigForm(false)
      setEditingConfig(null)
      setConfigFormData({ type: "usage", value: "", label: "" })
      showMessage("success", editingConfig ? "설정 항목이 수정되었습니다." : "설정 항목이 추가되었습니다.")
    } catch (error) {
      console.error("Error saving config:", error)
      showMessage("error", "설정 항목 저장 중 오류가 발생했습니다.")
    }
  }

  const handleDeleteConfig = async (id: number) => {
    if (!confirm("정말로 이 설정 항목을 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/config-options/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete config option")

      await loadConfigOptions()
      showMessage("success", "설정 항목이 삭제되었습니다.")
    } catch (error) {
      console.error("Error deleting config:", error)
      showMessage("error", "설정 항목 삭제 중 오류가 발생했습니다.")
    }
  }

  const getUsageOptions = () => configOptions.filter((opt) => opt.type === "usage")
  const getReceptionOptions = () => configOptions.filter((opt) => opt.type === "reception")
  const getLawOptions = () => configOptions.filter((opt) => opt.type === "laws")

  // 페이지네이션 로직
  const totalPages = Math.ceil(msdsItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = msdsItems.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // 페이지 크기 변경 시 첫 페이지로 이동
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className={`${isMobile ? "text-xl" : "text-xl md:text-2xl"} font-bold text-gray-900`}>MSDS 관리자</h1>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                메인으로
              </Button>
            </Link>
            {onLogout && (
              <Button onClick={handleLogout} variant="outline" size="sm" className={isMobile ? "px-3" : ""}>
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`px-4 md:px-6 py-3 ${message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border-b`}
        >
          <p className={`text-sm ${message.type === "success" ? "text-green-800" : "text-red-800"}`}>{message.text}</p>
        </div>
      )}

      <div className="p-4 md:p-6">
        {/* Upload Status Info */}
        <UploadStatusInfo />

        <Tabs defaultValue="msds" className="space-y-6">
          <TabsList
            className={`grid w-full ${isMobile ? "grid-cols-1 gap-2" : "grid-cols-2 md:grid-cols-4"} ${isMobile ? "h-auto p-2" : ""}`}
          >
            {isMobile ? (
              <>
                <TabsTrigger value="msds" className="py-3">
                  📋 MSDS 관리
                </TabsTrigger>
                <TabsTrigger value="symbols" className="py-3">
                  ⚠️ 경고 표지
                </TabsTrigger>
                <TabsTrigger value="equipment" className="py-3">
                  🛡️ 보호 장구
                </TabsTrigger>
                <TabsTrigger value="config" className="py-3">
                  ⚙️ 설정 관리
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="msds">MSDS 관리</TabsTrigger>
                <TabsTrigger value="symbols">경고 표지</TabsTrigger>
                <TabsTrigger value="equipment">보호 장구</TabsTrigger>
                <TabsTrigger value="config">설정 관리</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* MSDS 관리 탭 */}
          <TabsContent value="msds" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>MSDS 항목 관리 ({msdsItems.length}개)</span>
                  <Button onClick={handleAdd} size="sm">
                    <Plus className="h-4 w-4 mr-2" />새 항목 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mx-auto mb-2"></div>
                    <p>데이터를 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentItems.map((item) => (
                      <div
                        key={item.id}
                        className={`border border-gray-200 rounded-lg p-4 ${isMobile ? "space-y-4" : ""}`}
                      >
                        <div
                          className={`flex ${isMobile ? "flex-col gap-3" : "flex-col md:flex-row md:items-center justify-between gap-4"}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {item.msdsCode || `M${item.id.toString().padStart(4, '0')}`}
                              </span>
                            </div>
                            <h3 className="font-medium text-lg">{item.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary" className="bg-blue-500 text-white">
                                {item.usage}
                              </Badge>
                              {item.pdfFileName && <Badge variant="outline">PDF: {item.pdfFileName}</Badge>}
                              <Badge variant="outline">경고표지: {item.warningSymbols?.length || 0}개</Badge>
                              <Badge variant="outline">보호장구: {item.hazards?.length || 0}개</Badge>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>장소: {item.reception.join(", ")}</p>
                              <p>관련법: {item.laws.join(", ")}</p>
                            </div>
                          </div>

                          <div className={`flex ${isMobile ? "flex-col gap-3" : "flex-wrap gap-2"}`}>
                            <Button
                              variant="outline"
                              size={isMobile ? "default" : "sm"}
                              onClick={() => handleShowQR(item)}
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
                                    handlePdfUpload(item.id, file)
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={uploading}
                              />
                              <Button
                                variant="outline"
                                size={isMobile ? "default" : "sm"}
                                disabled={uploading}
                                className="w-full flex items-center justify-center gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                {uploading ? "업로드중" : "PDF 업로드"}
                              </Button>
                            </div>

                            <Button
                              variant="outline"
                              size={isMobile ? "default" : "sm"}
                              onClick={() => handleEdit(item)}
                              className="flex items-center justify-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              수정
                            </Button>

                            <Button
                              variant="destructive"
                              size={isMobile ? "default" : "sm"}
                              onClick={() => handleDelete(item.id)}
                              className="flex items-center justify-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              삭제
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {msdsItems.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>등록된 MSDS 항목이 없습니다.</p>
                        <p className="text-sm mt-1">새 항목을 추가해보세요.</p>
                      </div>
                    )}

                    {/* 페이지네이션 컨트롤 */}
                    {msdsItems.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
                        {/* 페이지 크기 선택 */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">페이지당 항목 수:</span>
                          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* 페이지 정보 */}
                        <div className="text-sm text-gray-600">
                          {startIndex + 1}-{Math.min(endIndex, msdsItems.length)} / {msdsItems.length} 항목
                        </div>

                        {/* 페이지 네비게이션 */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            이전
                          </Button>
                          
                          {/* 페이지 번호들 */}
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum
                              if (totalPages <= 5) {
                                pageNum = i + 1
                              } else if (currentPage <= 3) {
                                pageNum = i + 1
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                              } else {
                                pageNum = currentPage - 2 + i
                              }
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                  className="w-8 h-8 p-0"
                                >
                                  {pageNum}
                                </Button>
                              )
                            })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            다음
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 경고 표지 관리 탭 */}
          <TabsContent value="symbols" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>경고 표지 관리 ({warningSymbols.length}개)</span>
                  <Button onClick={() => setShowSymbolForm(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />새 경고 표지 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {warningSymbols.map((symbol) => (
                    <div key={symbol.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 border border-gray-300 rounded bg-white flex items-center justify-center">
                          <img
                            src={symbol.imageUrl || "/placeholder.svg"}
                            alt={symbol.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{symbol.name}</h3>
                          <p className="text-sm text-gray-600">{symbol.category}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{symbol.description}</p>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSymbol(symbol)
                            setSymbolFormData({
                              id: symbol.id,
                              name: symbol.name,
                              description: symbol.description,
                              category: symbol.category,
                              imageUrl: symbol.imageUrl,
                            })
                            setShowSymbolForm(true)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteSymbol(symbol.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 보호 장구 관리 탭 */}
          <TabsContent value="equipment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>보호 장구 관리 ({protectiveEquipment.length}개)</span>
                  <Button onClick={() => setShowEquipmentForm(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />새 보호 장구 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {protectiveEquipment.map((equipment) => (
                    <div key={equipment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 border border-gray-300 rounded bg-white flex items-center justify-center">
                          <img
                            src={equipment.imageUrl || "/placeholder.svg"}
                            alt={equipment.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{equipment.name}</h3>
                          <p className="text-sm text-gray-600">{equipment.category}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{equipment.description}</p>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingEquipment(equipment)
                            setEquipmentFormData({
                              id: equipment.id,
                              name: equipment.name,
                              description: equipment.description,
                              category: equipment.category,
                              imageUrl: equipment.imageUrl,
                            })
                            setShowEquipmentForm(true)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteEquipment(equipment.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 설정 관리 탭 */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>설정 옵션 관리 ({configOptions.length}개)</span>
                  <Button onClick={() => setShowConfigForm(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />새 설정 추가
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 용도 옵션 */}
                  <div>
                    <h3 className="font-medium mb-3">용도 옵션</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {getUsageOptions().map((option) => (
                        <div key={option.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{option.label}</span>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteConfig(option.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 장소 옵션 */}
                  <div>
                    <h3 className="font-medium mb-3">장소 옵션</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {getReceptionOptions().map((option) => (
                        <div key={option.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{option.label}</span>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteConfig(option.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 관련법 옵션 */}
                  <div>
                    <h3 className="font-medium mb-3">관련법 옵션</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {getLawOptions().map((option) => (
                        <div key={option.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{option.label}</span>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteConfig(option.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* QR 코드 출력 모달 */}
      <QRPrintModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} msdsItem={selectedQRItem} />

      {/* MSDS 추가/수정 모달 */}
      <Dialog
        open={showAddForm || editingItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddForm(false)
            setEditingItem(null)
            setFormData(initialFormData)
          }
        }}
      >
        <DialogContent
          className={`${isMobile ? "max-w-[95vw] max-h-[90vh] m-2" : "max-w-2xl max-h-[90vh]"} overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle>{editingItem ? "MSDS 항목 수정" : "새 MSDS 항목 추가"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">MSDS명 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 염산 35%"
              />
            </div>

            <div>
              <Label htmlFor="usage">용도 *</Label>
              <Select value={formData.usage} onValueChange={(value) => setFormData({ ...formData, usage: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="용도를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {getUsageOptions().map((option) => (
                    <SelectItem key={option.id} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>장소</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {getReceptionOptions().map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`reception-${option.id}`}
                      checked={formData.reception.includes(option.label)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            reception: [...formData.reception, option.label],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            reception: formData.reception.filter((r) => r !== option.label),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`reception-${option.id}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>관련법</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {getLawOptions().map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`law-${option.id}`}
                      checked={formData.laws.includes(option.label)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            laws: [...formData.laws, option.label],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            laws: formData.laws.filter((l) => l !== option.label),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`law-${option.id}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>경고 표지</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {warningSymbols.map((symbol) => (
                  <div key={symbol.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`symbol-${symbol.id}`}
                      checked={formData.warningSymbols.includes(symbol.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            warningSymbols: [...formData.warningSymbols, symbol.id],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            warningSymbols: formData.warningSymbols.filter((s) => s !== symbol.id),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`symbol-${symbol.id}`} className="text-sm">
                      {symbol.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>보호 장구</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {protectiveEquipment.map((equipment) => (
                  <div key={equipment.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`equipment-${equipment.id}`}
                      checked={formData.hazards.includes(equipment.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            hazards: [...formData.hazards, equipment.id],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            hazards: formData.hazards.filter((h) => h !== equipment.id),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`equipment-${equipment.id}`} className="text-sm">
                      {equipment.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={submitting} className="flex-1">
                {submitting ? "저장 중..." : "저장"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingItem(null)
                  setFormData(initialFormData)
                }}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 경고 표지 추가/수정 모달 */}
      <Dialog open={showSymbolForm} onOpenChange={setShowSymbolForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSymbol ? "경고 표지 수정" : "새 경고 표지 추가"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="symbol-name">이름 *</Label>
              <Input
                id="symbol-name"
                value={symbolFormData.name}
                onChange={(e) => setSymbolFormData({ ...symbolFormData, name: e.target.value })}
                placeholder="예: 부식성"
              />
            </div>

            <div>
              <Label htmlFor="symbol-description">설명</Label>
              <Input
                id="symbol-description"
                value={symbolFormData.description}
                onChange={(e) => setSymbolFormData({ ...symbolFormData, description: e.target.value })}
                placeholder="예: 피부나 눈에 심각한 화상을 일으킬 수 있음"
              />
            </div>

            <div>
              <Label htmlFor="symbol-category">카테고리</Label>
              <Select
                value={symbolFormData.category}
                onValueChange={(value) => setSymbolFormData({ ...symbolFormData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">물리적 위험</SelectItem>
                  <SelectItem value="health">건강 위험</SelectItem>
                  <SelectItem value="environmental">환경 위험</SelectItem>
                  <SelectItem value="custom">사용자 정의</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>이미지</Label>
              <ImageUpload
                currentImageUrl={symbolFormData.imageUrl}
                onImageChange={(url) => setSymbolFormData({ ...symbolFormData, imageUrl: url })}
                category="symbols"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveSymbol} className="flex-1">
                저장
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSymbolForm(false)
                  setEditingSymbol(null)
                  setSymbolFormData({ id: "", name: "", description: "", category: "physical", imageUrl: "" })
                }}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 보호 장구 추가/수정 모달 */}
      <Dialog open={showEquipmentForm} onOpenChange={setShowEquipmentForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEquipment ? "보호 장구 수정" : "새 보호 장구 추가"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="equipment-name">이름 *</Label>
              <Input
                id="equipment-name"
                value={equipmentFormData.name}
                onChange={(e) => setEquipmentFormData({ ...equipmentFormData, name: e.target.value })}
                placeholder="예: 독성 보호구"
              />
            </div>

            <div>
              <Label htmlFor="equipment-description">설명</Label>
              <Input
                id="equipment-description"
                value={equipmentFormData.description}
                onChange={(e) => setEquipmentFormData({ ...equipmentFormData, description: e.target.value })}
                placeholder="예: 독성 물질 취급 시 착용"
              />
            </div>

            <div>
              <Label htmlFor="equipment-category">카테고리</Label>
              <Select
                value={equipmentFormData.category}
                onValueChange={(value) => setEquipmentFormData({ ...equipmentFormData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="respiratory">호흡기 보호</SelectItem>
                  <SelectItem value="eye">눈 보호</SelectItem>
                  <SelectItem value="hand">손 보호</SelectItem>
                  <SelectItem value="body">몸 보호</SelectItem>
                  <SelectItem value="foot">발 보호</SelectItem>
                  <SelectItem value="custom">사용자 정의</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>이미지</Label>
              <ImageUpload
                currentImageUrl={equipmentFormData.imageUrl}
                onImageChange={(url) => setEquipmentFormData({ ...equipmentFormData, imageUrl: url })}
                category="protective"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveEquipment} className="flex-1">
                저장
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEquipmentForm(false)
                  setEditingEquipment(null)
                  setEquipmentFormData({ id: "", name: "", description: "", category: "respiratory", imageUrl: "" })
                }}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 설정 추가 모달 */}
      <Dialog open={showConfigForm} onOpenChange={setShowConfigForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>새 설정 옵션 추가</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="config-type">타입</Label>
              <Select
                value={configFormData.type}
                onValueChange={(value) => setConfigFormData({ ...configFormData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usage">용도</SelectItem>
                  <SelectItem value="reception">장소</SelectItem>
                  <SelectItem value="laws">관련법</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="config-label">이름 *</Label>
              <Input
                id="config-label"
                value={configFormData.label}
                onChange={(e) => setConfigFormData({ ...configFormData, label: e.target.value })}
                placeholder="예: 새로운 용도"
              />
            </div>

            <div>
              <Label htmlFor="config-value">값 (선택사항)</Label>
              <Input
                id="config-value"
                value={configFormData.value}
                onChange={(e) => setConfigFormData({ ...configFormData, value: e.target.value })}
                placeholder="자동 생성됨"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveConfig} className="flex-1">
                저장
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfigForm(false)
                  setConfigFormData({ type: "usage", value: "", label: "" })
                }}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
