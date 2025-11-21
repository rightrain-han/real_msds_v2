import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_WARNING_SYMBOLS } from "@/types/msds"

export async function GET() {
  try {
    const supabase = createAdminClient()

    if (!supabase) {
      console.log("[v0] Warning-symbols API: Supabase disabled, using defaults")
      return NextResponse.json(DEFAULT_WARNING_SYMBOLS)
    }

    const { data, error } = await supabase.from("warning_symbols").select("*").order("name", { ascending: true })

    if (error) {
      console.warn("[v0] Warning-symbols API error, using defaults:", error.message)
      return NextResponse.json(DEFAULT_WARNING_SYMBOLS)
    }

    const formatted = data.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      imageUrl: s.image_url,
      category: s.category,
      isActive: s.is_active,
    }))
    return NextResponse.json(formatted)
  } catch (err) {
    console.warn("[v0] Warning-symbols API fallback → defaults", err)
    return NextResponse.json(DEFAULT_WARNING_SYMBOLS)
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    if (!supabase) throw new Error("Supabase disabled in preview")

    const body = await request.json()
    console.log("🔥 [POST] Creating warning symbol:", body)

    // 데이터 검증
    if (!body.name || !body.id) {
      return NextResponse.json({ error: "Name and ID are required" }, { status: 400 })
    }

    // Supabase에 삽입
    const { data, error } = await supabase
      .from("warning_symbols")
      .insert({
        id: body.id,
        name: body.name,
        description: body.description || "",
        image_url: body.imageUrl || "/placeholder.svg",
        category: body.category || "physical",
        is_active: body.isActive !== false,
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Supabase insert error:", error)
      throw error
    }

    console.log("✅ Warning symbol created:", data)

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
    console.error("❌ Error creating warning symbol:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create warning symbol" },
      { status: 500 },
    )
  }
}
