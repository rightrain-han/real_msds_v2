import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const id = Number.parseInt(params.id)

    // MSDS 기본 정보 조회
    const { data: msdsItem, error: msdsError } = await supabase.from("msds_items").select("*").eq("id", id).single()

    if (msdsError) {
      return NextResponse.json({ error: "MSDS item not found" }, { status: 404 })
    }

    // 관련 데이터 조회
    const { data: warningSymbols } = await supabase
      .from("msds_warning_symbols")
      .select("warning_symbol_id")
      .eq("msds_id", id)

    const { data: protectiveEquipment } = await supabase
      .from("msds_protective_equipment")
      .select("protective_equipment_id")
      .eq("msds_id", id)

    const { data: configItems } = await supabase
      .from("msds_config_items")
      .select("config_type, config_value")
      .eq("msds_id", id)

    // 설정 항목을 타입별로 그룹화
    const reception = configItems?.filter((c) => c.config_type === "reception").map((c) => c.config_value) || []
    const laws = configItems?.filter((c) => c.config_type === "laws").map((c) => c.config_value) || []

    const formattedData = {
      id: msdsItem.id,
      name: msdsItem.name,
      pdfFileName: msdsItem.pdf_file_name || "",
      pdfUrl: msdsItem.pdf_file_url || "",
      hazards: protectiveEquipment?.map((pe) => pe.protective_equipment_id) || [],
      usage: msdsItem.usage,
      reception,
      laws,
      warningSymbols: warningSymbols?.map((ws) => ws.warning_symbol_id) || [],
      qrCode: msdsItem.qr_code || "",
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error fetching MSDS item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const id = Number.parseInt(params.id)
    const body = await request.json()

    // 1. MSDS 기본 정보 업데이트
    const { data: msdsItem, error: msdsError } = await supabase
      .from("msds_items")
      .update({
        name: body.name,
        pdf_file_name: body.pdfFileName,
        pdf_file_url: body.pdfUrl,
        usage: body.usage,
        qr_code: body.qrCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (msdsError) {
      return NextResponse.json({ error: "Failed to update MSDS item" }, { status: 500 })
    }

    // 2. 기존 연결 데이터 삭제
    await supabase.from("msds_warning_symbols").delete().eq("msds_id", id)
    await supabase.from("msds_protective_equipment").delete().eq("msds_id", id)
    await supabase.from("msds_config_items").delete().eq("msds_id", id)

    // 3. 새로운 연결 데이터 삽입
    if (body.warningSymbols && body.warningSymbols.length > 0) {
      const warningSymbolInserts = body.warningSymbols.map((symbolId: string) => ({
        msds_id: id,
        warning_symbol_id: symbolId,
      }))
      await supabase.from("msds_warning_symbols").insert(warningSymbolInserts)
    }

    if (body.hazards && body.hazards.length > 0) {
      const equipmentInserts = body.hazards.map((equipmentId: string) => ({
        msds_id: id,
        protective_equipment_id: equipmentId,
      }))
      await supabase.from("msds_protective_equipment").insert(equipmentInserts)
    }

    const configInserts = []
    if (body.reception && body.reception.length > 0) {
      body.reception.forEach((value: string) => {
        configInserts.push({
          msds_id: id,
          config_type: "reception",
          config_value: value,
        })
      })
    }

    if (body.laws && body.laws.length > 0) {
      body.laws.forEach((value: string) => {
        configInserts.push({
          msds_id: id,
          config_type: "laws",
          config_value: value,
        })
      })
    }

    if (configInserts.length > 0) {
      await supabase.from("msds_config_items").insert(configInserts)
    }

    return NextResponse.json(msdsItem)
  } catch (error) {
    console.error("Error updating MSDS item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const id = Number.parseInt(params.id)

    // CASCADE 설정으로 인해 관련 데이터는 자동 삭제됨
    const { error } = await supabase.from("msds_items").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete MSDS item" }, { status: 500 })
    }

    return NextResponse.json({ message: "MSDS item deleted successfully" })
  } catch (error) {
    console.error("Error deleting MSDS item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
