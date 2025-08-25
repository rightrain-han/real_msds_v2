import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function DELETE(request: NextRequest) {
  try {
    console.log("🗑️ Image Delete started")

    const supabase = createAdminClient()

    if (!supabase) {
      console.error("❌ Failed to create Supabase admin client")
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get("filePath")

    if (!filePath) {
      console.error("❌ No file path provided")
      return NextResponse.json({ error: "File path is required" }, { status: 400 })
    }

    console.log("🗑️ Deleting file:", filePath)

    // Supabase Storage에서 이미지 삭제
    const { error: deleteError } = await supabase.storage.from("msds-files").remove([filePath])

    if (deleteError) {
      console.error("❌ Delete error:", deleteError)
      return NextResponse.json(
        {
          error: `Failed to delete image: ${deleteError.message}`,
        },
        { status: 500 },
      )
    }

    console.log("✅ Image deleted successfully")

    return NextResponse.json({
      message: "Image deleted successfully",
      filePath,
    })
  } catch (error) {
    console.error("💥 Unexpected error in image delete:", error)
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
