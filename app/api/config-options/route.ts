import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const supabase = createAdminClient()

    if (!supabase) {
      console.log("🔧 [GET] Supabase disabled in preview → returning fallback data")
      return NextResponse.json(getDefaultConfig())
    }

    console.log("🔧 [GET] Loading config options from Supabase...")

    const { data, error } = await supabase
      .from("config_options")
      .select("*")
      .eq("is_active", true)
      .order("type", { ascending: true })
      .order("label", { ascending: true })

    if (error) {
      console.error("🔧 [GET] Supabase error:", error)
      return NextResponse.json(getDefaultConfig())
    }

    console.log("🔧 [GET] Config options loaded:", data?.length || 0, "items")

    return NextResponse.json(data || [])
  } catch (err) {
    console.warn("🔧 [GET] Config options API fallback → defaults", err)
    return NextResponse.json(getDefaultConfig())
  }
}

function getDefaultConfig() {
  return [
    { id: 1, type: "usage", value: "pure_reagent", label: "순수시약", is_active: true },
    { id: 2, type: "usage", value: "nox_reduction", label: "NOx저감", is_active: true },
    { id: 3, type: "usage", value: "wastewater_treatment", label: "폐수처리", is_active: true },
    { id: 4, type: "usage", value: "boiler_water_treatment", label: "보일러용수처리", is_active: true },
    { id: 5, type: "reception", value: "lng_3_cpp", label: "LNG 3호기 CPP", is_active: true },
    { id: 6, type: "reception", value: "lng_4_cpp", label: "LNG 4호기 CPP", is_active: true },
    { id: 7, type: "reception", value: "water_treatment", label: "수처리동", is_active: true },
    { id: 8, type: "reception", value: "bio_2_scr", label: "BIO 2호기 SCR", is_active: true },
    { id: 9, type: "laws", value: "chemical_safety", label: "화학물질안전법", is_active: true },
    { id: 10, type: "laws", value: "industrial_safety", label: "산업안전보건법", is_active: true },
  ]
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is not available in preview mode" }, { status: 503 })
    }

    const body = await request.json()
    console.log("🔥 [POST] Creating config option:", body)

    // 데이터 검증
    if (!body.label || !body.type) {
      return NextResponse.json({ error: "Label and type are required" }, { status: 400 })
    }

    // value가 없으면 label에서 자동 생성
    const value =
      body.value ||
      body.label
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")

    // Supabase에 삽입
    const { data, error } = await supabase
      .from("config_options")
      .insert({
        type: body.type,
        value: value,
        label: body.label,
        is_active: body.isActive !== false,
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Supabase insert error:", error)
      return NextResponse.json({ error: error.message || "Failed to create config option" }, { status: 500 })
    }

    console.log("✅ Config option created:", data)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("❌ Error creating config option:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create config option" },
      { status: 500 },
    )
  }
}
