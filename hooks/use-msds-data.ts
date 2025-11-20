"use client"

import { useState, useEffect } from "react"
import type { MsdsItem } from "../lib/msds-data"

/**
 * Client-side hook that loads the MSDS JSON from `/public/data/msds-data.json`.
 * Returns the list plus loading / error state that the dashboard expects.
 */
export function useMsdsData() {
  const [msdsData, setMsdsData] = useState<MsdsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/data/msds-data.json", { cache: "no-store" })
        if (!res.ok) throw new Error("MSDS JSON 파일을 불러올 수 없습니다.")
        const data: MsdsItem[] = await res.json()
        setMsdsData(data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "알 수 없는 오류")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { msdsData, loading, error }
}
