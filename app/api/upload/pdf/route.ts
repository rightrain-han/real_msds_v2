import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    console.log("📤 PDF Upload started")

    // RLS를 우회하기 위해 Service-Role Client 사용
    const supabase = createAdminClient()

    if (!supabase) {
      console.error("❌ Failed to create Supabase admin client")
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const msdsId = formData.get("msdsId") as string

    console.log("📋 Upload details:", {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      msdsId,
    })

    if (!file) {
      console.error("❌ No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // 파일 유효성 검사
    if (file.type !== "application/pdf") {
      console.error("❌ Invalid file type:", file.type)
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      console.error("❌ File too large:", file.size)
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // 파일명 생성 (중복 방지)
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const fileName = `${timestamp}_${sanitizedFileName}`
    const filePath = `pdfs/${fileName}`

    console.log("📁 File path:", filePath)

    // Supabase Storage에 파일 업로드
    console.log("⬆️ Uploading to Supabase Storage...")
    const { data: uploadData, error: uploadError } = await supabase.storage.from("msds-files").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("❌ Upload error:", uploadError)
      return NextResponse.json(
        {
          error: `Failed to upload file: ${uploadError.message}`,
        },
        { status: 500 },
      )
    }

    console.log("✅ Upload successful:", uploadData)

    // 업로드된 파일의 공개 URL 가져오기
    const { data: urlData } = supabase.storage.from("msds-files").getPublicUrl(filePath)

    console.log("🔗 Public URL:", urlData.publicUrl)

    // MSDS 항목이 지정된 경우 Service-Role 권한으로 업데이트
    if (msdsId) {
      console.log("📝 Updating MSDS item:", msdsId)
      const { error: updateError } = await supabase
        .from("msds_items")
        .update({
          pdf_file_name: fileName,
          pdf_file_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number.parseInt(msdsId))

      if (updateError) {
        console.error("❌ Update error:", updateError)
        return NextResponse.json(
          {
            error: `Failed to update MSDS item: ${updateError.message}`,
          },
          { status: 500 },
        )
      }

      console.log("✅ MSDS item updated successfully")
    }

    return NextResponse.json({
      fileName,
      fileUrl: urlData.publicUrl,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("💥 Unexpected error in upload:", error)
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
