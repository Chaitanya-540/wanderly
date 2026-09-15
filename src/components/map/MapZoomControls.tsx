'use client'

/**
 * Zoom +/- and Reset buttons rendered as HTML over the 3D canvas.
 * They dispatch custom events that IndiaMap listens to.
 */

function dispatch(type: 'map:zoom-in' | 'map:zoom-out' | 'map:reset') {
  window.dispatchEvent(new CustomEvent(type))
}

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  background: 'rgba(11,11,13,0.82)',
  border: '1px solid rgba(255,184,107,0.18)',
  borderRadius: '6px',
  color: 'rgba(232,224,212,0.7)',
  cursor: 'pointer',
  fontFamily: 'var(--font-ui), Inter, sans-serif',
  fontSize: '16px',
  lineHeight: 1,
  transition: 'all 0.15s ease',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
}

export default function MapZoomControls() {
  return (
    <div
      role="group"
      aria-label="Map zoom controls"
      style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
    >
      <button
        style={btnStyle}
        aria-label="Zoom in"
        onClick={() => dispatch('map:zoom-in')}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FFB86B'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,184,107,0.5)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(232,224,212,0.7)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,184,107,0.18)' }}
      >
        +
      </button>
      <button
        style={btnStyle}
        aria-label="Zoom out"
        onClick={() => dispatch('map:zoom-out')}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FFB86B'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,184,107,0.5)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(232,224,212,0.7)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,184,107,0.18)' }}
      >
        −
      </button>
      <button
        style={{ ...btnStyle, fontSize: '10px', letterSpacing: '0.04em', height: '26px' }}
        aria-label="Reset map view"
        onClick={() => dispatch('map:reset')}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FFB86B'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,184,107,0.5)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(232,224,212,0.7)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,184,107,0.18)' }}
      >
        ⊙
      </button>
    </div>
  )
}
