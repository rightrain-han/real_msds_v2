"use client"
import { useState } from "react"
import type { WarningSymbol } from "../types/msds"

interface WarningSymbolProps {
  symbol: WarningSymbol
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

export function WarningSymbolComponent({ symbol, size = "md", showTooltip = true }: WarningSymbolProps) {
  const [showTooltipState, setShowTooltipState] = useState(false)
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltipState(true)}
      onMouseLeave={() => setShowTooltipState(false)}
    >
      <div
        className={`${sizeClasses[size]} transform rotate-45 border border-gray-300 bg-white flex items-center justify-center overflow-hidden`}
      >
        <div className="transform -rotate-45 w-full h-full flex items-center justify-center">
          {!imageError ? (
            <img
              src={symbol.imageUrl || "/placeholder.svg"}
              alt={symbol.name}
              className="w-full h-full object-contain"
              onError={handleImageError}
            />
          ) : (
            <div className="text-xs font-bold text-gray-600 text-center">{symbol.name.charAt(0)}</div>
          )}
        </div>
      </div>

      {showTooltip && showTooltipState && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            <div className="font-medium">{symbol.name}</div>
            <div className="text-gray-300">{symbol.description}</div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
        </div>
      )}
    </div>
  )
}
