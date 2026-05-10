'use client'

import { useState, type FormEvent } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  loading: boolean
}

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search movies or series…"
        className="min-w-0 flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="shrink-0 rounded-lg bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed px-3 sm:px-5 py-2.5 font-semibold text-zinc-950 transition-colors"
        aria-label="Search"
      >
        <span className="hidden sm:inline">{loading ? 'Searching…' : 'Search'}</span>
        <span className="sm:hidden text-lg">{loading ? '⏳' : '🔍'}</span>
      </button>
    </form>
  )
}
