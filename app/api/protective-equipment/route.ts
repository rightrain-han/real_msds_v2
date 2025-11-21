import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_PROTECTIVE_EQUIPMENT } from "@/types/msds"

export async function GET() {
  try {
    const supabase = createAdminClient()

    if (!supabase) {
      console.log("[v0] Protective-equipment API: Supabase disabled, using defaults")
      return NextResponse.json(DEFAULT_PROTECTIVE_EQUIPMENT)
    }

    const { data, error } = await supabase.from("protective_equipment").select("*").order("name", { ascending: true })

    if (error) {
      console.warn("[v0] Protective-equipment API error, using defaults:", error.message)
      return NextResponse.json(DEFAULT_PROTECTIVE_EQUIPMENT)
    }

    const formatted = data.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      imageUrl: e.image_url,
      category: e.category,
      isActive: e.is_active,
    }))
    return NextResponse.json(formatted)
  } catch (err) {
    console.warn("[v0] Protective-equipment API fallback → defaults", err)
    return NextResponse.json(DEFAULT_PROTECTIVE_EQUIPMENT)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    if (!supabase) throw new Error("Supabase disabled in preview")

    const body = await request.json()
    console.log("🔥 [POST] Creating protective equipment:", body)

    // 데이터 검증
    if (!body.name || !body.id) {
      return NextResponse.json({ error: "Name and ID are required" }, { status: 400 })
    }

    // Supabase에 삽입
    const { data, error } = await supabase
      .from("protective_equipment")
      .insert({
        id: body.id,
        name: body.name,
        description: body.description || "",
        image_url: body.imageUrl || "/placeholder.svg",
        category: body.category || "respiratory",
        is_active: body.isActive !== false,
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Supabase insert error:", error)
      throw error
    }

    console.log("✅ Protective equipment created:", data)

    // 응답 형식 변환
    const formatted = {
      id: data.id,
      name: data.name,
      description: data.description,
      imageUrl: data.image_url,
      category: data.category,
      isActive: data.is_active,
    }

    return NextResponse.json({ success: true, data: formatted })
  } catch (error) {
    console.error("❌ Error creating protective equipment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create protective equipment" },
      { status: 500 },
    )
  }
}
