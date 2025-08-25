"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FilterDropdownProps {
  label: string
  options: string[]
  onFilter: (value: string) => void
  className?: string
}

/**
 * Generic dropdown used on the MSDS list filters.
 * Keeps its own local state and notifies parent via `onFilter`.
 */
export default function FilterDropdown({ label, options, onFilter, className }: FilterDropdownProps) {
  const [value, setValue] = useState(options[0] ?? "")

  const handleChange = (newValue: string) => {
    setValue(newValue)
    onFilter(newValue)
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-sm font-medium">{label}</span>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="w-40 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
