export interface MsdsItem {
  id: number
  name: string
  pdfFileName: string
  hazards: string[]
  usage: string
  reception: string[]
  laws: string[]
}

export async function getMsdsData(): Promise<MsdsItem[]> {
  try {
    const response = await fetch("/data/msds-data.json")
    if (!response.ok) {
      throw new Error("Failed to fetch MSDS data")
    }
    return await response.json()
  } catch (error) {
    console.error("Error loading MSDS data:", error)
    return []
  }
}

export const HAZARD_OPTIONS = [
  { value: "flammable", label: "인화성", color: "bg-red-500" },
  { value: "toxic", label: "독성", color: "bg-orange-500" },
  { value: "corrosive", label: "부식성", color: "bg-yellow-500" },
  { value: "oxidizing", label: "산화성", color: "bg-blue-500" },
]

export const USAGE_OPTIONS = ["순수시약", "NOx저감", "용매", "방부제", "화학원료", "측정기기", "금속재료", "화학원"]

export const RECEPTION_OPTIONS = [
  "LNG 3호기 CPP",
  "LNG 4호기 CPP",
  "수처리동",
  "BIO 2호기 SCR",
  "LNG 4호기 SCR",
  "화학실험실",
  "실험실",
]

export const LAW_OPTIONS = ["화학물질안전법", "산업안전보건법"]
