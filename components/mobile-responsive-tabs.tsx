"use client"

import type React from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

interface MobileResponsiveTabsProps {
  children: React.ReactNode
  defaultValue: string
  isMobile: boolean
}

export function MobileResponsiveTabs({ children, defaultValue, isMobile }: MobileResponsiveTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Mobile Tab Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab("msds")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "msds" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              MSDS 관리
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "config" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              설정 관리
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <button
              onClick={() => setActiveTab("symbols")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "symbols" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              경고 표지
            </button>
            <button
              onClick={() => setActiveTab("equipment")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "equipment" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              보호 장구
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {children}
        </Tabs>
      </div>
    )
  }

  // Desktop version
  return (
    <Tabs defaultValue={defaultValue} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="msds">MSDS 관리</TabsTrigger>
        <TabsTrigger value="symbols">경고 표지</TabsTrigger>
        <TabsTrigger value="equipment">보호 장구</TabsTrigger>
        <TabsTrigger value="config">설정 관리</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  )
}
