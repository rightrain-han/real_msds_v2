"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin-login"
import AdminDashboard from "@/admin-dashboard"
import { RefreshCw } from "lucide-react"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 1) 현재 세션 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("/api/admin/verify")
        const data = await res.json()
        setIsAuthenticated(data.authenticated)
      } catch (err) {
        console.error("auth verify error", err)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuthStatus()
  }, [])

  // 2) 로그인 처리
  const handleLogin = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) setIsAuthenticated(true)
      return data.success
    } catch (err) {
      console.error("login error", err)
      return false
    }
  }

  // 3) 로그아웃 처리
  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" })
    setIsAuthenticated(false)
  }

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // 인증 안 됨 → 로그인 UI
  if (!isAuthenticated) return <AdminLogin onLogin={handleLogin} />

  // 인증 완료 → 대시보드
  return <AdminDashboard onLogout={handleLogout} />
}
