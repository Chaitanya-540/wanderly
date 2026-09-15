'use client'

const LINKS = ['About', 'Data & Sources', 'Terms', 'Contact']

/**
 * Client Component — owns the onMouseEnter/onMouseLeave hover logic
 * for the footer navigation links.
 */
export default function FooterLinks() {
  return (
    <ul className="flex flex-wrap justify-center gap-6" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {LINKS.map(item => (
        <li key={item}>
          <a
            href="#"
            className="font-ui transition-colors focus:outline-none focus-visible:underline"
            style={{ fontSize: '12px', letterSpacing: '0.06em', color: 'rgba(232,224,212,0.3)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,184,107,0.7)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(232,224,212,0.3)')}
          >
            {item}
          </a>
        </li>
      ))}
    </ul>
  )
}
