import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'HeatGuard', template: '%s | HeatGuard' },
  description: 'Real-time heat safety monitoring for outdoor workforces',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'HeatGuard' },
}

export const viewport: Viewport = {
  themeColor: '#00D15A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {children}
      </body>
    </html>
  )
}
