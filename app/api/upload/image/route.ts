import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    console.log("🖼️ Image Upload started")

    const supabase = createAdminClient()

    if (!supabase) {
      console.error("❌ Failed to create Supabase admin client")
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const category = formData.get("category") as string // 'symbols' or 'protective'

    console.log("📋 Upload details:", {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      category,
    })

    if (!file) {
      console.error("❌ No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // 이미지 파일 유효성 검사
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      console.error("❌ Invalid file type:", file.type)
      return NextResponse.json({ error: "Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed" }, { status: 400 })
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error("❌ File too large:", file.size)
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // 카테고리 검증
    if (!category || !["symbols", "protective"].includes(category)) {
      console.error("❌ Invalid category:", category)
      return NextResponse.json({ error: "Invalid category. Must be 'symbols' or 'protective'" }, { status: 400 })
    }

    // 파일명 생성 (중복 방지)
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const fileName = `${timestamp}_${sanitizedFileName}`
    const filePath = `images/${category}/${fileName}`

    console.log("📁 File path:", filePath)

    // Supabase Storage에 이미지 업로드
    console.log("⬆️ Uploading to Supabase Storage...")
    const { data: uploadData, error: uploadError } = await supabase.storage.from("msds-files").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("❌ Upload error:", uploadError)
      return NextResponse.json(
        {
          error: `Failed to upload image: ${uploadError.message}`,
        },
        { status: 500 },
      )
    }

    console.log("✅ Upload successful:", uploadData)

    // 업로드된 파일의 공개 URL 가져오기
    const { data: urlData } = supabase.storage.from("msds-files").getPublicUrl(filePath)

    console.log("🔗 Public URL:", urlData.publicUrl)

    return NextResponse.json({
      fileName,
      fileUrl: urlData.publicUrl,
      filePath,
      category,
      message: "Image uploaded successfully",
    })
  } catch (error) {
    console.error("💥 Unexpected error in image upload:", error)
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
