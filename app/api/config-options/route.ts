import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@supabase/supabase-js"

interface ConfigInsert {
  id: number
  type: string
  value: string
  label: string
  is_active: boolean
}

export async function GET() {
  const fallbackData: ConfigInsert[] = [
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

  try {
    /* 1️⃣  관리자(서비스-롤) 클라이언트 시도 */
    const admin = createAdminClient()
    if (admin) {
      const { data, error } = await admin
        .from("config_options")
        .select("*")
        .eq("is_active", true)
        .order("type", { ascending: true })
        .order("label", { ascending: true })

      if (!error && data) return NextResponse.json(data)
      console.warn("🔧 [GET] Admin client error →", error?.message)
    }

    /* 2️⃣  퍼블릭(ANON) 클라이언트 폴백 */
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && anon) {
      const publicClient = createClient(url, anon)
      const { data, error } = await publicClient
        .from("config_options")
        .select("*")
        .eq("is_active", true)
        .order("type", { ascending: true })
        .order("label", { ascending: true })

      if (!error && data) return NextResponse.json(data)
      console.warn("🔧 [GET] Public client error →", error?.message)
    } else {
      console.warn("🔧 [GET] Public Supabase env vars not set")
    }
  } catch (err) {
    /* SyntaxError(Invalid JSON) 등 모든 예외 캐치 */
    console.error("🔧 [GET] Supabase fetch exception →", err)
  }

  /* 3️⃣  최종 폴백 – 기본값 반환 */
  return NextResponse.json(fallbackData)
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    if (!supabase) throw new Error("Supabase disabled in preview")

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
      throw error
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
