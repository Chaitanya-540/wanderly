'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ATTRACTIONS } from '@/data/attractions'
import { useFilterStore } from '@/store/filterStore'
import type { AttractionCategory, MoodTag } from '@/types/attraction'

const ALL_STATES = [...new Set(ATTRACTIONS.map((a) => a.state))].sort()
const ALL_CATEGORIES: AttractionCategory[] = [
  'Temple', 'Fort', 'Beach', 'Wildlife', 'Mountain', 'Lake', 'Museum', 'City', 'Waterfall', 'Heritage',
]

export default function QuickList() {
  const { activeMoods, toggleMood, activeCategory, setActiveCategory, activeState, setActiveState, searchQuery, setSearchQuery } =
    useFilterStore()

  const filtered = useMemo(() => {
    return ATTRACTIONS.filter((a) => {
      if (activeState && a.state !== activeState) return false
      if (activeCategory && a.category !== activeCategory) return false
      if (activeMoods.size > 0 && !a.moodTags.some((t) => activeMoods.has(t))) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (
          !a.name.toLowerCase().includes(q) &&
          !a.city.toLowerCase().includes(q) &&
          !a.state.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [activeState, activeCategory, activeMoods, searchQuery])

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 p-4 border-b border-white/10">
        {/* Search */}
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search…"
          className="bg-white/10 text-white placeholder-white/40 px-3 py-1.5 rounded-lg text-sm border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 w-48"
          aria-label="Search attractions"
        />
        {/* State filter */}
        <select
          value={activeState ?? ''}
          onChange={(e) => setActiveState(e.target.value || null)}
          className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          aria-label="Filter by state"
        >
          <option value="">All States</option>
          {ALL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {/* Category filter */}
        <select
          value={activeCategory ?? ''}
          onChange={(e) => setActiveCategory((e.target.value as AttractionCategory) || null)}
          className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Results count */}
      <div className="px-4 py-2 text-xs text-white/40">
        {filtered.length} attraction{filtered.length !== 1 ? 's' : ''} found
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto divide-y divide-white/5" role="list">
        {filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-white/40 text-sm">
            No attractions match your filters.
          </li>
        ) : (
          filtered.map((a) => (
            <li key={a.id}>
              <Link
                href={`/attraction/${a.id}`}
                className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors focus:outline-none focus-visible:bg-white/10"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{a.name}</div>
                  <div className="text-xs text-white/50">{a.city}, {a.state}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {a.moodTags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-white/30 mt-0.5 shrink-0">{a.category}</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
