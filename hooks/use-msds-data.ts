/**
 * MSDS 데이터 관리 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react'
import type { MsdsItem, WarningSymbol, ProtectiveEquipment } from '@/types/msds'
import { DEFAULT_WARNING_SYMBOLS, DEFAULT_PROTECTIVE_EQUIPMENT } from '@/types/msds'
import { API_ENDPOINTS, REFRESH } from '@/lib/constants'

interface UseMsdsDataReturn {
  msdsData: MsdsItem[]
  warningSymbols: WarningSymbol[]
  protectiveEquipment: ProtectiveEquipment[]
  loading: boolean
  refreshing: boolean
  error: string | null
  loadData: (showLoading?: boolean) => Promise<void>
  refresh: () => Promise<void>
}

export function useMsdsData(): UseMsdsDataReturn {
  const [msdsData, setMsdsData] = useState<MsdsItem[]>([])
  const [warningSymbols, setWarningSymbols] = useState<WarningSymbol[]>(DEFAULT_WARNING_SYMBOLS)
  const [protectiveEquipment, setProtectiveEquipment] = useState<ProtectiveEquipment[]>(DEFAULT_PROTECTIVE_EQUIPMENT)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      console.log('🔍 MSDS 데이터 로딩 시작...')

      // MSDS 데이터와 관련 정보를 병렬로 로드
      const [msdsResponse, symbolsResponse, equipmentResponse] = await Promise.all([
        fetch(API_ENDPOINTS.MSDS, { cache: 'no-store' }),
        fetch(API_ENDPOINTS.WARNING_SYMBOLS, { cache: 'no-store' }),
        fetch(API_ENDPOINTS.PROTECTIVE_EQUIPMENT, { cache: 'no-store' }),
      ])

      let msdsData = []
      let symbolsData = []
      let equipmentData = []

      // MSDS 데이터 처리
      if (msdsResponse.ok) {
        msdsData = await msdsResponse.json()
      } else {
        console.warn(`⚠️ ${API_ENDPOINTS.MSDS} returned ${msdsResponse.status}. Falling back to /public JSON.`)
        const fallbackResponse = await fetch('/data/msds-data.json', { cache: 'no-store' })
        if (fallbackResponse.ok) {
          msdsData = await fallbackResponse.json()
        }
      }

      // 경고 표지 데이터 처리
      if (symbolsResponse.ok) {
        symbolsData = await symbolsResponse.json()
      }

      // 보호 장구 데이터 처리
      if (equipmentResponse.ok) {
        equipmentData = await equipmentResponse.json()
      }

      // MSDS 데이터에 실제 경고 표지와 보호 장구 정보 매핑
      const enrichedMsdsData = msdsData.map((item) => {
        const warningSymbolsData = symbolsData.filter((symbol) => 
          item.warningSymbols?.includes(symbol.id)
        )
        const protectiveEquipmentData = equipmentData.filter((equipment) => 
          item.hazards?.includes(equipment.id)
        )

        return {
          ...item,
          warningSymbolsData,
          protectiveEquipmentData,
          pdfUrl: item.pdfUrl || item.pdf_file_url || `/pdfs/${item.pdfFileName}`,
        }
      })

      console.log('✅ MSDS 데이터 로드 성공:', enrichedMsdsData.length, '개 항목')

      setMsdsData(enrichedMsdsData)
      setWarningSymbols(symbolsData)
      setProtectiveEquipment(equipmentData)
      setError(null)
    } catch (err) {
      console.error('❌ MSDS 데이터 로딩 오류:', err)
      if (showLoading) {
        setError(err instanceof Error ? err.message : '데이터 로딩 실패')

        // 최종 fallback - 하드코딩된 샘플 데이터
        console.log('🔄 하드코딩된 샘플 데이터로 fallback')
        const sampleData = [
          {
            id: 1,
            name: '염산 35% (샘플)',
            pdfFileName: 'HYDROCHLORIC_ACID.pdf',
            pdfUrl: '/pdfs/HYDROCHLORIC_ACID.pdf',
            hazards: ['toxic', 'corrosive'],
            usage: '순수시약',
            reception: ['LNG 3호기 CPP', '수처리동'],
            laws: ['화학물질안전법', '산업안전보건법'],
            warningSymbols: ['corrosive', 'toxic'],
          },
          {
            id: 2,
            name: '가성소다 45% (샘플)',
            pdfFileName: 'SODIUM_HYDROXIDE.pdf',
            pdfUrl: '/pdfs/SODIUM_HYDROXIDE.pdf',
            hazards: ['corrosive'],
            usage: '순수시약',
            reception: ['LNG 4호기 CPP', '수처리동'],
            laws: ['화학물질안전법'],
            warningSymbols: ['corrosive'],
          },
        ]
        setMsdsData(sampleData)
      }
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  // 초기 데이터 로드
  useEffect(() => {
    loadData()
  }, [loadData])

  // 실시간 데이터 새로고침을 위한 interval
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(false) // 로딩 상태 없이 백그라운드에서 새로고침
    }, REFRESH.INTERVAL_MS)

    return () => clearInterval(interval)
  }, [loadData])

  return {
    msdsData,
    warningSymbols,
    protectiveEquipment,
    loading,
    refreshing,
    error,
    loadData,
    refresh,
  }
}