'use client'

import { MOOD_TAGS } from '@/data/moodTags'
import { useFilterStore } from '@/store/filterStore'
import type { MoodTag } from '@/types/attraction'

const MOOD_ICONS: Record<MoodTag, string> = {
  Relaxing: '◌', Adventure: '◈', Cultural: '◎', Nature: '◉',
  Family: '◇', Romantic: '◆', Spiritual: '☽', Food: '◐',
  Wildlife: '◑', Beach: '◒',
}

export default function MoodFilter() {
  const { activeMoods, toggleMood, clearMoods } = useFilterStore()

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by mood">
      <span
        className="font-ui hidden sm:inline-block"
        style={{ fontSize: '9px', letterSpacing: '0.18em', color: 'rgba(255,184,107,0.45)', marginRight: '4px' }}
      >
        MOOD
      </span>

      {MOOD_TAGS.map(tag => {
        const active = activeMoods.has(tag)
        return (
          <button
            key={tag}
            onClick={() => toggleMood(tag)}
            aria-pressed={active}
            className="flex items-center gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
            style={{
              fontSize: '11px',
              letterSpacing: '0.04em',
              padding: '5px 12px',
              borderRadius: '999px',
              fontFamily: 'var(--font-ui), Inter, sans-serif',
              fontWeight: active ? 600 : 400,
              background: active ? 'rgba(255,184,107,0.18)' : 'rgba(11,11,13,0.7)',
              border: `1px solid ${active ? 'rgba(255,184,107,0.55)' : 'rgba(255,255,255,0.08)'}`,
              color: active ? '#FFB86B' : 'rgba(232,224,212,0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: active ? '0 0 10px rgba(255,184,107,0.15)' : 'none',
            }}
          >
            <span aria-hidden style={{ fontSize: '9px', opacity: 0.7 }}>{MOOD_ICONS[tag]}</span>
            {tag}
          </button>
        )
      })}

      {activeMoods.size > 0 && (
        <button
          onClick={clearMoods}
          className="font-ui transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
          style={{
            fontSize: '10px',
            letterSpacing: '0.08em',
            padding: '5px 10px',
            color: 'rgba(232,224,212,0.3)',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          CLEAR
        </button>
      )}
    </div>
  )
}
