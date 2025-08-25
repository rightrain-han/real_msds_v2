"use client"
import { useState } from "react"
import type { ProtectiveEquipment } from "../types/msds"

interface ProtectiveEquipmentProps {
  equipment: ProtectiveEquipment
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

export function ProtectiveEquipmentComponent({ equipment, size = "md", showTooltip = true }: ProtectiveEquipmentProps) {
  const [showTooltipState, setShowTooltipState] = useState(false)
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
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
        className={`${sizeClasses[size]} border border-gray-300 bg-white flex items-center justify-center overflow-hidden rounded`}
      >
        {!imageError ? (
          <img
            src={equipment.imageUrl || "/placeholder.svg"}
            alt={equipment.name}
            className="w-full h-full object-contain"
            onError={handleImageError}
          />
        ) : (
          <div className="text-xs font-bold text-gray-600 text-center">{equipment.name.charAt(0)}</div>
        )}
      </div>

      {showTooltip && showTooltipState && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            <div className="font-medium">{equipment.name}</div>
            <div className="text-gray-300">{equipment.description}</div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
        </div>
      )}
    </div>
  )
}
