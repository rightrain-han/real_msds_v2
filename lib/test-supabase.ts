import { getSupabaseBrowser } from "@/lib/supabase"

export async function testSupabaseConnection() {
  console.log("🔍 Supabase 연결 테스트 시작...")

  const supabase = getSupabaseBrowser()
  if (!supabase) {
    console.error("❌ Supabase 클라이언트를 생성할 수 없습니다. 환경 변수를 확인하세요.")
    return false
  }

  try {
    // 1. 테이블 존재 확인
    console.log("📋 테이블 존재 확인 중...")
    const { data: tables, error: tablesError } = await supabase
      .from("msds_items")
      .select("count", { count: "exact", head: true })

    if (tablesError) {
      console.error("❌ msds_items 테이블에 접근할 수 없습니다:", tablesError.message)
      return false
    }

    console.log("✅ msds_items 테이블 접근 성공")

    // 2. 설정 옵션 데이터 확인
    console.log("⚙️ 설정 옵션 데이터 확인 중...")
    const { data: configData, error: configError } = await supabase.from("config_options").select("*").limit(5)

    if (configError) {
      console.error("❌ config_options 테이블 오류:", configError.message)
      return false
    }

    console.log("✅ 설정 옵션 데이터:", configData?.length, "개 항목 발견")

    // 3. 경고 표지 데이터 확인
    console.log("⚠️ 경고 표지 데이터 확인 중...")
    const { data: symbolsData, error: symbolsError } = await supabase.from("warning_symbols").select("*").limit(5)

    if (symbolsError) {
      console.error("❌ warning_symbols 테이블 오류:", symbolsError.message)
      return false
    }

    console.log("✅ 경고 표지 데이터:", symbolsData?.length, "개 항목 발견")

    // 4. Storage 버킷 확인
    console.log("📁 Storage 버킷 확인 중...")
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("❌ Storage 버킷 오류:", bucketsError.message)
      return false
    }

    const msdsFilesBucket = buckets?.find((bucket) => bucket.name === "msds-files")
    if (msdsFilesBucket) {
      console.log("✅ msds-files 버킷 발견:", msdsFilesBucket.public ? "Public" : "Private")
    } else {
      console.warn("⚠️ msds-files 버킷을 찾을 수 없습니다.")
    }

    console.log("🎉 Supabase 연결 테스트 완료!")
    return true
  } catch (error) {
    console.error("❌ Supabase 연결 테스트 실패:", error)
    return false
  }
}
