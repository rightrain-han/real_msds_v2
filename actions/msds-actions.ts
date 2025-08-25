"use server"

import { revalidatePath } from "next/cache"
import type { MsdsItem } from "../lib/msds-data"

// 실제 운영환경에서는 데이터베이스를 사용해야 합니다.
// 여기서는 시뮬레이션을 위한 메모리 저장소를 사용합니다.
let msdsData: MsdsItem[] = []

// 초기 데이터 로드 (실제로는 데이터베이스에서)
async function loadInitialData() {
  if (msdsData.length === 0) {
    try {
      const response = await fetch("http://localhost:3000/data/msds-data.json")
      if (response.ok) {
        msdsData = await response.json()
      }
    } catch (error) {
      console.error("Failed to load initial data:", error)
    }
  }
}

export async function getAllMsdsItems(): Promise<MsdsItem[]> {
  await loadInitialData()
  return msdsData
}

export async function createMsdsItem(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await loadInitialData()

    const name = formData.get("name") as string
    const pdfFileName = formData.get("pdfFileName") as string
    const usage = formData.get("usage") as string
    const hazards = formData.getAll("hazards") as string[]
    const reception = formData.getAll("reception") as string[]
    const laws = formData.getAll("laws") as string[]

    if (!name || !pdfFileName || !usage) {
      return { success: false, message: "필수 필드를 모두 입력해주세요." }
    }

    const newId = Math.max(...msdsData.map((item) => item.id), 0) + 1
    const newItem: MsdsItem = {
      id: newId,
      name,
      pdfFileName,
      hazards,
      usage,
      reception,
      laws,
    }

    msdsData.push(newItem)
    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true, message: "MSDS 항목이 성공적으로 추가되었습니다." }
  } catch (error) {
    console.error("Error creating MSDS item:", error)
    return { success: false, message: "항목 추가 중 오류가 발생했습니다." }
  }
}

export async function updateMsdsItem(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await loadInitialData()

    const id = Number.parseInt(formData.get("id") as string)
    const name = formData.get("name") as string
    const pdfFileName = formData.get("pdfFileName") as string
    const usage = formData.get("usage") as string
    const hazards = formData.getAll("hazards") as string[]
    const reception = formData.getAll("reception") as string[]
    const laws = formData.getAll("laws") as string[]

    if (!name || !pdfFileName || !usage) {
      return { success: false, message: "필수 필드를 모두 입력해주세요." }
    }

    const itemIndex = msdsData.findIndex((item) => item.id === id)
    if (itemIndex === -1) {
      return { success: false, message: "해당 항목을 찾을 수 없습니다." }
    }

    msdsData[itemIndex] = {
      id,
      name,
      pdfFileName,
      hazards,
      usage,
      reception,
      laws,
    }

    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true, message: "MSDS 항목이 성공적으로 수정되었습니다." }
  } catch (error) {
    console.error("Error updating MSDS item:", error)
    return { success: false, message: "항목 수정 중 오류가 발생했습니다." }
  }
}

export async function deleteMsdsItem(id: number): Promise<{ success: boolean; message: string }> {
  try {
    await loadInitialData()

    const itemIndex = msdsData.findIndex((item) => item.id === id)
    if (itemIndex === -1) {
      return { success: false, message: "해당 항목을 찾을 수 없습니다." }
    }

    msdsData.splice(itemIndex, 1)
    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true, message: "MSDS 항목이 성공적으로 삭제되었습니다." }
  } catch (error) {
    console.error("Error deleting MSDS item:", error)
    return { success: false, message: "항목 삭제 중 오류가 발생했습니다." }
  }
}
