import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import NavBar from '@/components/ui/NavBar'

// Cormorant Garamond — brand-exclusive display font (logo + major lockup only)
const cormorant = localFont({
  src: [
    { path: '../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-cormorant',
  display: 'swap',
})

// Playfair Display — editorial headings throughout the site
const playfair = localFont({
  src: [
    { path: '../../node_modules/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/playfair-display/files/playfair-display-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-playfair',
  display: 'swap',
})

// Montserrat — body, UI, navigation
const montserrat = localFont({
  src: [
    { path: '../../node_modules/@fontsource/montserrat/files/montserrat-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/montserrat/files/montserrat-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Wanderly — Discover India. One glow at a time.',
    template: '%s — Wanderly',
  },
  description: 'Wanderly is a cinematic India travel discovery platform. Explore 84+ destinations, plan personalised itineraries, and estimate trip costs.',
  openGraph: {
    siteName: 'Wanderly',
    title: 'Wanderly — Discover India. One glow at a time.',
    description: 'Cinematic India travel discovery. Explore destinations, plan itineraries, estimate budgets.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${playfair.variable} ${montserrat.variable}`}>
      <body className="antialiased bg-[#0b0b0d] text-[#e8e0d4] font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#FFB86B] focus:text-[#0b0b0d] focus:rounded-md focus:font-medium focus:outline-none"
        >
          Skip to main content
        </a>
        <NavBar />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  )
}
