'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/quick-list',   label: 'Explore',      icon: '◈' },
  { href: '/trip-planner', label: 'Plan',          icon: '◎' },
  { href: '/favorites',    label: 'Saved',         icon: '◇' },
  { href: '/account',      label: 'Account',       icon: '◉' },
]

export default function NavBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 glass-dark border-b border-[rgba(255,184,107,0.10)]"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">

        {/* Logo + tagline — Cormorant Garamond brand-exclusive */}
        <Link
          href="/"
          className="flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B] rounded-sm"
          aria-label="Wanderly — home"
        >
          <span
            style={{
              fontFamily: 'var(--font-cormorant, Cormorant Garamond, serif)',
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#e8d9c4',
              lineHeight: 1,
            }}
          >
            WANDERLY
          </span>
          <span
            className="hidden sm:block font-ui"
            style={{ fontSize: '8.5px', letterSpacing: '0.20em', color: 'rgba(255,184,107,0.42)', marginTop: '3px' }}
          >
            DISCOVER INDIA. ONE GLOW AT A TIME.
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md font-ui text-[13px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
                style={{
                  color: active ? '#FFB86B' : 'rgba(232,224,212,0.55)',
                  background: active ? 'rgba(255,184,107,0.08)' : 'transparent',
                  letterSpacing: '0.06em',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(232,224,212,0.9)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(232,224,212,0.55)' }}
              >
                <span aria-hidden style={{ fontSize: '10px', opacity: 0.6 }}>{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(v => !v)}
          style={{ color: 'rgba(232,224,212,0.6)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open
              ? <><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></>
              : <><line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="3" y1="14" x2="17" y2="14"/></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="sm:hidden border-t"
          style={{ background: 'rgba(11,11,13,0.97)', borderColor: 'rgba(255,184,107,0.1)' }}
        >
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className="flex items-center gap-3 px-6 py-4 font-ui text-sm font-medium transition-colors focus:outline-none"
                style={{
                  color: active ? '#FFB86B' : 'rgba(232,224,212,0.6)',
                  background: active ? 'rgba(255,184,107,0.06)' : 'transparent',
                  letterSpacing: '0.06em',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <span aria-hidden style={{ fontSize: '14px', opacity: 0.5 }}>{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
