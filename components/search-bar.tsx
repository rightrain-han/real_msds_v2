/**
 * 검색 바 컴포넌트
 */

import React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { MESSAGES } from '@/lib/constants'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onClearSearch: () => void
  isMobile: boolean
}

export function SearchBar({ searchQuery, onSearchChange, onClearSearch, isMobile }: SearchBarProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        placeholder={MESSAGES.SEARCH_PLACEHOLDER}
        className={`w-full pl-10 pr-10 ${isMobile ? 'py-4 text-base' : 'py-3'} bg-white/95 backdrop-blur-sm border-white/30 text-gray-900 placeholder-gray-500 rounded-xl shadow-lg focus:ring-2 focus:ring-white/50`}
        value={searchQuery}
        onChange={handleInputChange}
      />
      {searchQuery && (
        <button
          onClick={onClearSearch}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}