/**
 * 모바일 감지 커스텀 훅
 */

import { useState, useEffect } from 'react'
import { PAGINATION } from '@/lib/constants'

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < PAGINATION.MOBILE_BREAKPOINT)
    }

    // 초기 체크
    checkMobile()

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', checkMobile)
    
    // 클린업
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}