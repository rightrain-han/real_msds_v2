import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    if (!supabase) throw new Error("Supabase disabled in preview")

    const body = await request.json()
    const { id } = params

    console.log("🔥 [PUT] Updating config option:", id, body)

    // value가 없으면 label에서 자동 생성
    const value =
      body.value ||
      body.label
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")

    // Supabase에서 업데이트
    const { data, error } = await supabase
      .from("config_options")
      .update({
        type: body.type,
        value: value,
        label: body.label,
        is_active: body.isActive !== false,
      })
      .eq("id", Number.parseInt(id))
      .select()
      .single()

    if (error) {
      console.error("❌ Supabase update error:", error)
      throw error
    }

    console.log("✅ Config option updated:", data)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("❌ Error updating config option:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update config option" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    if (!supabase) throw new Error("Supabase disabled in preview")

    const { id } = params
    console.log("🔥 [DELETE] Deleting config option:", id)

    // Supabase에서 삭제
    const { error } = await supabase.from("config_options").delete().eq("id", Number.parseInt(id))

    if (error) {
      console.error("❌ Supabase delete error:", error)
      throw error
    }

    console.log("✅ Config option deleted:", id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Error deleting config option:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete config option" },
      { status: 500 },
    )
  }
}
