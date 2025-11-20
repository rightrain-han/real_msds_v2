"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export interface SearchBarProps {
  onSearch: (term: string) => void
  placeholder?: string
}

export default function SearchBar({ onSearch, placeholder = "Search…" }: SearchBarProps) {
  const [value, setValue] = useState("")

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xs gap-2">
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1"
        aria-label="Search MSDS"
      />
      <Button
        type="submit"
        size="icon"
        variant="outline"
        className="bg-neutral-100 text-neutral-800"
        aria-label="Submit search"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  )
}
