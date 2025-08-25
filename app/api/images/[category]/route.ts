import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    const { category } = params

    if (!["symbols", "protective"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Supabase Storage에서 이미지 목록 가져오기
    const { data: files, error } = await supabase.storage.from("msds-files").list(`images/${category}`, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    })

    if (error) {
      console.error("Error listing images:", error)
      return NextResponse.json({ error: "Failed to load images" }, { status: 500 })
    }

    // 파일 정보를 URL과 함께 반환
    const images =
      files?.map((file) => {
        const filePath = `images/${category}/${file.name}`
        const { data: urlData } = supabase.storage.from("msds-files").getPublicUrl(filePath)

        return {
          name: file.name,
          url: urlData.publicUrl,
          path: filePath,
          size: file.metadata?.size,
          uploadedAt: file.created_at,
        }
      }) || []

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error in images API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
