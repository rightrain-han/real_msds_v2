import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_PROTECTIVE_EQUIPMENT } from "@/types/msds"

export async function GET() {
  try {
    console.log("[v0] Protective-equipment API: Starting request")
    const supabase = createAdminClient()

    if (!supabase) {
      console.log("[v0] Protective-equipment API: Supabase disabled, using defaults")
      return NextResponse.json(DEFAULT_PROTECTIVE_EQUIPMENT)
    }

    console.log("[v0] Protective-equipment API: Querying database")

    let data, error
    try {
      const result = await supabase.from("protective_equipment").select("*").order("name", { ascending: true })
      data = result.data
      error = result.error

      console.log("[v0] Protective-equipment raw result:", {
        hasData: !!data,
        dataLength: data?.length,
        hasError: !!error,
        errorType: error ? typeof error : "none",
        errorConstructor: error?.constructor?.name,
        errorKeys: error ? Object.keys(error) : [],
        fullError: error ? JSON.stringify(error, null, 2) : "none",
      })
    } catch (queryError) {
      console.error("[v0] Protective-equipment query exception:", {
        message: queryError instanceof Error ? queryError.message : String(queryError),
        stack: queryError instanceof Error ? queryError.stack : "no stack",
        type: typeof queryError,
        constructor: queryError?.constructor?.name,
      })
      console.log("[v0] Protective-equipment API: Query failed, using defaults")
      return NextResponse.json(DEFAULT_PROTECTIVE_EQUIPMENT)
    }

    if (error) {
      console.error("[v0] Protective-equipment API error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        rawError: JSON.stringify(error),
      })
      console.log("[v0] Protective-equipment API: Using defaults due to error")
      return NextResponse.json(DEFAULT_PROTECTIVE_EQUIPMENT)
    }

    if (!data || data.length === 0) {
      console.log("[v0] Protective-equipment API: No data found in database, using defaults")
      return NextResponse.json(DEFAULT_PROTECTIVE_EQUIPMENT)
    }

    console.log(`[v0] Protective-equipment API: Found ${data.length} items in database`)
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
    console.error("[v0] Protective-equipment API outer exception:", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : "no stack",
      type: typeof err,
      constructor: err?.constructor?.name,
    })
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
