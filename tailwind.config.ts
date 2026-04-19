import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── shadcn / Radix CSS-variable palette (required for border-border etc.) ──
        background:  'oklch(var(--background) / <alpha-value>)',
        foreground:  'oklch(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT:    'oklch(var(--card) / <alpha-value>)',
          foreground: 'oklch(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT:    'oklch(var(--popover) / <alpha-value>)',
          foreground: 'oklch(var(--popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT:    'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT:    'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT:    'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(1 0 0 / <alpha-value>)',
        },
        border:  'oklch(var(--border) / <alpha-value>)',
        input:   'oklch(var(--input) / <alpha-value>)',
        ring:    'oklch(var(--ring) / <alpha-value>)',
        sidebar: {
          DEFAULT:             'oklch(var(--sidebar) / <alpha-value>)',
          foreground:          'oklch(var(--sidebar-foreground) / <alpha-value>)',
          primary:             'oklch(var(--sidebar-primary) / <alpha-value>)',
          'primary-foreground':'oklch(var(--sidebar-primary-foreground) / <alpha-value>)',
          accent:              'oklch(var(--sidebar-accent) / <alpha-value>)',
          'accent-foreground': 'oklch(var(--sidebar-accent-foreground) / <alpha-value>)',
          border:              'oklch(var(--sidebar-border) / <alpha-value>)',
          ring:                'oklch(var(--sidebar-ring) / <alpha-value>)',
        },
        // ── Chart palette ──────────────────────────────────────────────────────────
        'chart-1': 'oklch(var(--chart-1) / <alpha-value>)',
        'chart-2': 'oklch(var(--chart-2) / <alpha-value>)',
        'chart-3': 'oklch(var(--chart-3) / <alpha-value>)',
        'chart-4': 'oklch(var(--chart-4) / <alpha-value>)',
        'chart-5': 'oklch(var(--chart-5) / <alpha-value>)',
        // ── HeatGuard brand heat scale ────────────────────────────────────────────
        heat: {
          caution:  '#FFCC00',
          warning:  '#FF6B00',
          danger:   '#FF3B30',
          critical: '#9B1C1C',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      // Safe area insets for iPhone notch / home indicator
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
}

export default config
