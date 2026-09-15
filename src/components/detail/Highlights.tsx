interface HighlightsProps {
  highlights: string[]
  insiderTips: string[]
}

export default function Highlights({ highlights, insiderTips }: HighlightsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <section aria-labelledby="highlights-heading">
        <h2
          id="highlights-heading"
          style={{ fontFamily: 'var(--font-playfair, Playfair Display, serif)', fontSize: 20, fontWeight: 600, color: '#e8e0d4', marginBottom: 16 }}
        >
          Highlights
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {highlights.map((h, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {/* Numbered bullet — no emoji */}
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  borderRadius: 99,
                  background: 'rgba(255,184,107,0.1)',
                  border: '1px solid rgba(255,184,107,0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 8,
                  color: '#FFB86B',
                  fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(232,224,212,0.7)', fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)', flex: 1, margin: 0 }}>
                {h}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="tips-heading">
        <h2
          id="tips-heading"
          style={{ fontFamily: 'var(--font-playfair, Playfair Display, serif)', fontSize: 20, fontWeight: 600, color: '#e8e0d4', marginBottom: 16 }}
        >
          Insider Tips
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {insiderTips.map((tip, i) => (
            <li
              key={i}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(255,184,107,0.05)',
                border: '1px solid rgba(255,184,107,0.12)',
                borderLeft: '3px solid rgba(255,184,107,0.35)',
                fontSize: 13,
                lineHeight: 1.6,
                color: 'rgba(232,224,212,0.68)',
                fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
              }}
            >
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
