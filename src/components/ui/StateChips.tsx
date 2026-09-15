'use client'

import Link from 'next/link'

interface StateChipsProps {
  states: { name: string; count: number }[]
}

/**
 * Client Component — owns the onMouseEnter/onMouseLeave hover logic
 * for the state filter chips on the homepage.
 * Receives plain serializable props from the Server Component parent.
 */
export default function StateChips({ states }: StateChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {states.map(({ name, count }) => (
        <Link
          key={name}
          href={`/quick-list?state=${encodeURIComponent(name)}`}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-ui font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
          style={{
            fontSize: '11px',
            letterSpacing: '0.04em',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(232,224,212,0.6)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,184,107,0.08)'
            el.style.borderColor = 'rgba(255,184,107,0.3)'
            el.style.color = '#FFB86B'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,255,255,0.03)'
            el.style.borderColor = 'rgba(255,255,255,0.07)'
            el.style.color = 'rgba(232,224,212,0.6)'
          }}
        >
          {name}
          <span style={{ fontSize: '9px', opacity: 0.35 }}>({count})</span>
        </Link>
      ))}
    </div>
  )
}
