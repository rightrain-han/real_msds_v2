import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    if (!supabase) throw new Error("Supabase disabled in preview")

    const body = await request.json()
    const { id } = params

    console.log("🔥 [PUT] Updating warning symbol:", id, body)

    // Supabase에서 업데이트
    const { data, error } = await supabase
      .from("warning_symbols")
      .update({
        name: body.name,
        description: body.description || "",
        image_url: body.imageUrl || "/placeholder.svg",
        category: body.category || "physical",
        is_active: body.isActive !== false,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("❌ Supabase update error:", error)
      throw error
    }

    console.log("✅ Warning symbol updated:", data)

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
    console.error("❌ Error updating warning symbol:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update warning symbol" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    if (!supabase) throw new Error("Supabase disabled in preview")

    const { id } = params
    console.log("🔥 [DELETE] Deleting warning symbol:", id)

    // Supabase에서 삭제
    const { error } = await supabase.from("warning_symbols").delete().eq("id", id)

    if (error) {
      console.error("❌ Supabase delete error:", error)
      throw error
    }

    console.log("✅ Warning symbol deleted:", id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Error deleting warning symbol:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete warning symbol" },
      { status: 500 },
    )
  }
}
