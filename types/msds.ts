export interface MsdsItem {
  id: number
  name: string
  pdfFileName: string
  pdfUrl?: string
  hazards: string[]
  usage: string
  reception: string[]
  laws: string[]
  warningSymbols: string[]
  warningSymbolsData?: WarningSymbol[] // 실제 경고 표지 데이터
  protectiveEquipmentData?: ProtectiveEquipment[] // 실제 보호 장구 데이터
  qrCode?: string
}

export interface WarningSymbol {
  id: string
  name: string
  description: string
  imageUrl: string
  category: "physical" | "health" | "environmental" | "custom"
  isActive: boolean
}

export interface ProtectiveEquipment {
  id: string
  name: string
  description: string
  imageUrl: string
  category: "respiratory" | "eye" | "hand" | "body" | "foot" | "custom"
  isActive: boolean
}

export interface HazardOption {
  value: string
  label: string
  color: string
}

export interface ConfigOption {
  id: number
  type: string
  value: string
  label: string
  is_active: boolean
}

export const DEFAULT_WARNING_SYMBOLS: WarningSymbol[] = [
  {
    id: "corrosive",
    name: "부식성",
    description: "피부나 눈에 심각한 화상을 일으킬 수 있음",
    imageUrl: "/images/symbols/corrosive.png",
    category: "physical",
    isActive: true,
  },
  {
    id: "health_hazard",
    name: "건강 유해성",
    description: "호흡기, 생식기능 또는 기타 장기에 손상을 일으킬 수 있음",
    imageUrl: "/images/symbols/health_hazard.png",
    category: "health",
    isActive: true,
  },
  {
    id: "toxic",
    name: "독성",
    description: "삼키거나 흡입하면 생명에 위험할 수 있음",
    imageUrl: "/images/symbols/toxic.png",
    category: "health",
    isActive: true,
  },
  {
    id: "environmental",
    name: "환경 유해성",
    description: "수생생물에 유독하며 장기적 영향을 일으킬 수 있음",
    imageUrl: "/images/symbols/environmental.png",
    category: "environmental",
    isActive: true,
  },
  {
    id: "flammable",
    name: "인화성",
    description: "쉽게 불이 붙을 수 있음",
    imageUrl: "/images/symbols/flammable.png",
    category: "physical",
    isActive: true,
  },
  {
    id: "oxidizing",
    name: "산화성",
    description: "화재를 일으키거나 강화시킬 수 있음",
    imageUrl: "/images/symbols/oxidizing.png",
    category: "physical",
    isActive: true,
  },
]

export const DEFAULT_PROTECTIVE_EQUIPMENT: ProtectiveEquipment[] = [
  {
    id: "flammable",
    name: "인화성 보호구",
    description: "인화성 물질 취급 시 착용",
    imageUrl: "/images/protective/flammable.png",
    category: "body",
    isActive: true,
  },
  {
    id: "toxic",
    name: "독성 보호구",
    description: "독성 물질 취급 시 착용",
    imageUrl: "/images/protective/toxic.png",
    category: "respiratory",
    isActive: true,
  },
  {
    id: "corrosive",
    name: "부식성 보호구",
    description: "부식성 물질 취급 시 착용",
    imageUrl: "/images/protective/corrosive.png",
    category: "eye",
    isActive: true,
  },
  {
    id: "oxidizing",
    name: "산화성 보호구",
    description: "산화성 물질 취급 시 착용",
    imageUrl: "/images/protective/oxidizing.png",
    category: "hand",
    isActive: true,
  },
]

export const DEFAULT_HAZARD_OPTIONS: HazardOption[] = [
  { value: "flammable", label: "인화성", color: "bg-red-500" },
  { value: "toxic", label: "독성", color: "bg-orange-500" },
  { value: "corrosive", label: "부식성", color: "bg-yellow-500" },
  { value: "oxidizing", label: "산화성", color: "bg-blue-500" },
]

export const DEFAULT_USAGE_OPTIONS = [
  "순수시약",
  "NOx저감",
  "폐수처리",
  "보일러용수처리",
  "과학물질분야",
  "연료",
  "소독용 가스",
  "발전기 냉각",
  "Purge",
  "절연",
  "세정제",
]

export const DEFAULT_RECEPTION_OPTIONS = [
  "LNG 3호기 CPP",
  "LNG 4호기 CPP",
  "수처리동",
  "BIO 2호기 SCR",
  "LNG 4호기 SCR",
  "발전소 보일러",
  "DO TANK",
  "LNG 보일러",
]

export const DEFAULT_LAW_OPTIONS = ["화학물질안전법", "산업안전보건법"]
