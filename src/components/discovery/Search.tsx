'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useMapStore } from '@/store/mapStore'
import { useUIStore } from '@/store/uiStore'
import { searchAttractions } from '@/services/searchAttractions'
import { ATTRACTIONS } from '@/data/attractions'
import { projectToXZ } from '@/utils/geo'
import type { Attraction } from '@/types/attraction'

const DEBOUNCE_MS = 300

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Attraction[]>([])
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { setCameraTarget, setActiveAttraction, setIsAnimating } = useMapStore()
  const { setActiveDestinationCardId } = useUIStore()

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return }
    setResults(searchAttractions(ATTRACTIONS, q))
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(query), DEBOUNCE_MS)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, runSearch])

  function handleSelect(a: Attraction) {
    const [x, z] = projectToXZ(a.coordinates.lng, a.coordinates.lat)
    setCameraTarget([x, 0, z])
    setIsAnimating(true)
    setActiveAttraction(a.id)
    setTimeout(() => setActiveDestinationCardId(a.id), 1700)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const showDropdown = open && (results.length > 0 || (query.trim().length > 0))

  return (
    <div className="relative" style={{ width: 'min(300px, calc(100vw - 130px))' }}>
      <label htmlFor="map-search" className="sr-only">Search attractions, cities, states</label>

      <div
        className="relative flex items-center"
        style={{
          background: focused ? 'rgba(17,17,20,0.9)' : 'rgba(17,17,20,0.72)',
          border: `1px solid ${focused ? 'rgba(255,184,107,0.45)' : 'rgba(255,184,107,0.16)'}`,
          borderRadius: '12px',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'all 0.2s ease',
          boxShadow: focused ? '0 0 0 3px rgba(255,184,107,0.08)' : 'none',
        }}
      >
        <span
          aria-hidden
          style={{ paddingLeft: '14px', color: 'rgba(255,184,107,0.4)', fontSize: '14px', lineHeight: 1, flexShrink: 0 }}
        >
          ⌕
        </span>
        <input
          id="map-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setFocused(true); setOpen(true) }}
          onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 160) }}
          placeholder="Search attractions, cities, states..."
          autoComplete="off"
          className="flex-1 bg-transparent focus:outline-none font-ui"
          style={{
            padding: '10px 12px',
            fontSize: '13px',
            color: 'rgba(232,224,212,0.9)',
            caretColor: '#FFB86B',
          }}
          aria-autocomplete="list"
          aria-controls="search-listbox"
          aria-expanded={showDropdown}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
            aria-label="Clear search"
            className="pr-3 focus:outline-none"
            style={{ color: 'rgba(232,224,212,0.3)', fontSize: '14px' }}
            tabIndex={-1}
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <ul
          id="search-listbox"
          role="listbox"
          className="absolute top-full mt-1.5 w-full overflow-hidden rounded-xl"
          style={{
            background: 'rgba(11,11,13,0.97)',
            border: '1px solid rgba(255,184,107,0.14)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            zIndex: 60,
          }}
        >
          {results.length === 0 && query.trim() && (
            <li
              className="px-4 py-3.5 font-ui"
              style={{ fontSize: '12px', color: 'rgba(232,224,212,0.35)', letterSpacing: '0.04em' }}
            >
              No results for "{query}"
            </li>
          )}
          {results.map(a => (
            <li key={a.id} role="option" aria-selected={false}>
              <button
                onMouseDown={() => handleSelect(a)}
                className="w-full text-left flex items-center gap-3 px-4 py-3 focus:outline-none transition-colors"
                style={{ background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,184,107,0.05)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-medium truncate" style={{ fontSize: '13px', color: 'rgba(232,224,212,0.88)' }}>
                    {a.name}
                  </p>
                  <p className="font-ui truncate mt-0.5" style={{ fontSize: '10px', color: 'rgba(232,224,212,0.35)', letterSpacing: '0.06em' }}>
                    {a.city.toUpperCase()} · {a.state.toUpperCase()}
                  </p>
                </div>
                <span className="font-ui shrink-0" style={{ fontSize: '10px', color: 'rgba(255,184,107,0.4)', letterSpacing: '0.06em' }}>
                  {a.category}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
