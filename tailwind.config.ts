import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens
        'bg-primary':   '#0b0b0d',
        'bg-secondary': '#111114',
        'bg-surface':   '#17171b',
        'bg-raised':    '#1e1e23',
        'bg-muted':     '#2b2b2f',
        'gold':         '#FFB86B',
        'gold-bright':  '#FFC987',
        'amber':        '#FF9F43',
        'coral':        '#FF6B6B',
      },
      fontFamily: {
        brand:  ['var(--font-cormorant)', 'Cormorant Garamond', 'Bodoni Moda', 'Georgia', 'serif'],
        serif:  ['var(--font-playfair)', 'Playfair Display', 'Merriweather', 'Georgia', 'serif'],
        sans:   ['var(--font-montserrat)', 'Montserrat', 'Lato', 'system-ui', 'sans-serif'],
        ui:     ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
