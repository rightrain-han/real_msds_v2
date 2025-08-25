"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff } from "lucide-react"
import AdminDashboard from "@/admin-dashboard"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/verify", { method: "GET", credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated) {
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }
    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
        credentials: "include",
      })

      if (response.ok) {
        setIsAuthenticated(true)
        setPassword("")
      } else {
        const data = await response.json()
        setError(data.error || "로그인에 실패했습니다.")
      }
    } catch (error) {
      setError("서버 연결에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    fetch("/api/admin/login", { method: "DELETE", credentials: "include" }).finally(() => {
      setIsAuthenticated(false)
      setPassword("")
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">관리자 로그인</CardTitle>
            <CardDescription>MSDS 시스템 관리자 패널에 접근하려면 비밀번호를 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="관리자 비밀번호를 입력하세요"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</div>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }
  return <AdminDashboard onLogout={handleLogout} />
}
