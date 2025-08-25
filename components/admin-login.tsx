"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react"

interface AdminLoginProps {
  onLogin: (password: string) => Promise<boolean>
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      setError("암호를 입력해주세요.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const success = await onLogin(password)
      if (!success) {
        setError("잘못된 암호입니다. 다시 시도해주세요.")
        setPassword("")
      }
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다.")
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">관리자 로그인</CardTitle>
            <p className="text-sm text-gray-600 mt-2">MSDS 시스템 관리자 페이지에 접속하려면 암호를 입력하세요.</p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">관리자 암호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="암호를 입력하세요"
                  className="pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">초기 암호: 0000</p>
              <p className="text-xs text-gray-400 mt-1">보안을 위해 암호를 변경하는 것을 권장합니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
