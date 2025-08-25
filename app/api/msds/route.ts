import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
// JSON 파일을 정적 import 하면 Next.js가 번들에 포함합니다.
import localMsdsData from "@/public/data/msds-data.json"
import type { MsdsItem } from "@/types/msds"

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Supabase 설정이 없는 v0 미리보기라면 createAdminClient() 가
    // null 을 던지므로 여기로 jump 합니다.
    if (!supabase) throw new Error("Supabase disabled in preview")

    // MSDS 기본 정보와 관련 데이터를 조인하여 조회
    const { data: msdsItems, error } = await supabase
      .from("msds_items")
      .select(`
        *,
        msds_warning_symbols(warning_symbol_id),
        msds_protective_equipment(protective_equipment_id),
        msds_config_items(config_type, config_value)
      `)
      .order("id", { ascending: true })

    if (error) throw error

    // 경고 표지와 보호 장구 정보를 별도로 조회
    const [warningSymbolsResponse, protectiveEquipmentResponse] = await Promise.all([
      supabase.from("warning_symbols").select("*"),
      supabase.from("protective_equipment").select("*"),
    ])

    const warningSymbols = warningSymbolsResponse.data || []
    const protectiveEquipment = protectiveEquipmentResponse.data || []

    // 데이터 매핑 및 변환
    const enrichedItems: MsdsItem[] = msdsItems.map((item) => {
      // 경고 표지 ID 배열 생성
      const warningSymbolIds = item.msds_warning_symbols?.map((ws: any) => ws.warning_symbol_id) || []

      // 보호 장구 ID 배열 생성
      const protectiveEquipmentIds = item.msds_protective_equipment?.map((pe: any) => pe.protective_equipment_id) || []

      // 설정 항목 분류
      const configItems = item.msds_config_items || []
      const reception = configItems.filter((c: any) => c.config_type === "reception").map((c: any) => c.config_value)
      const laws = configItems.filter((c: any) => c.config_type === "laws").map((c: any) => c.config_value)

      // 실제 경고 표지 데이터 매핑
      const warningSymbolsData = warningSymbols
        .filter((symbol) => warningSymbolIds.includes(symbol.id))
        .map((symbol) => ({
          id: symbol.id,
          name: symbol.name,
          description: symbol.description,
          imageUrl: symbol.image_url,
          category: symbol.category,
          isActive: symbol.is_active,
        }))

      // 실제 보호 장구 데이터 매핑
      const protectiveEquipmentData = protectiveEquipment
        .filter((equipment) => protectiveEquipmentIds.includes(equipment.id))
        .map((equipment) => ({
          id: equipment.id,
          name: equipment.name,
          description: equipment.description,
          imageUrl: equipment.image_url,
          category: equipment.category,
          isActive: equipment.is_active,
        }))

      return {
        id: item.id,
        name: item.name,
        pdfFileName: item.pdf_file_name || "",
        pdfUrl: item.pdf_file_url || "",
        hazards: protectiveEquipmentIds, // 하위 호환성을 위해 ID 배열 유지
        usage: item.usage,
        reception,
        laws,
        warningSymbols: warningSymbolIds, // 하위 호환성을 위해 ID 배열 유지
        warningSymbolsData, // 실제 데이터 추가
        protectiveEquipmentData, // 실제 데이터 추가
        qrCode: item.qr_code || "",
      }
    })

    console.log("✅ MSDS API: Loaded", enrichedItems.length, "items with enriched data")
    return NextResponse.json(enrichedItems)
  } catch (err) {
    // 최종 fallback – 정적 JSON (개발·프리뷰 환경용)
    console.warn("MSDS API fallback → static json", err)

    // 폴백 데이터에도 빈 배열로 초기화하여 에러 방지
    const fallbackData: MsdsItem[] = localMsdsData.map((item) => ({
      ...item,
      warningSymbolsData: [],
      protectiveEquipmentData: [],
    }))

    return NextResponse.json(fallbackData)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    if (!supabase) throw new Error("Supabase disabled in preview")

    const body = await request.json()

    // MSDS 기본 정보 삽입
    const { data: msdsItem, error: msdsError } = await supabase
      .from("msds_items")
      .insert({
        name: body.name,
        pdf_file_name: body.pdfFileName,
        pdf_url: body.pdfUrl,
        usage: body.usage,
      })
      .select()
      .single()

    if (msdsError) throw msdsError

    // 경고 표지 연결
    if (body.warningSymbols && body.warningSymbols.length > 0) {
      const warningSymbolInserts = body.warningSymbols.map((symbolId: string) => ({
        msds_id: msdsItem.id,
        warning_symbol_id: symbolId,
      }))

      await supabase.from("msds_warning_symbols").insert(warningSymbolInserts)
    }

    // 보호 장구 연결
    if (body.hazards && body.hazards.length > 0) {
      const protectiveEquipmentInserts = body.hazards.map((equipmentId: string) => ({
        msds_id: msdsItem.id,
        protective_equipment_id: equipmentId,
      }))

      await supabase.from("msds_protective_equipment").insert(protectiveEquipmentInserts)
    }

    // 설정 항목 연결
    const configInserts: Array<{
      msds_id: number
      config_type: string
      config_value: string
    }> = []

    if (body.reception && body.reception.length > 0) {
      body.reception.forEach((value: string) => {
        configInserts.push({
          msds_id: msdsItem.id,
          config_type: "reception",
          config_value: value,
        })
      })
    }

    if (body.laws && body.laws.length > 0) {
      body.laws.forEach((value: string) => {
        configInserts.push({
          msds_id: msdsItem.id,
          config_type: "laws",
          config_value: value,
        })
      })
    }

    if (configInserts.length > 0) {
      await supabase.from("msds_config_items").insert(configInserts)
    }

    return NextResponse.json({ success: true, data: msdsItem })
  } catch (error) {
    console.error("Error creating MSDS item:", error)
    return NextResponse.json({ error: "Failed to create MSDS item" }, { status: 500 })
  }
}
