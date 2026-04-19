import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HeatGuard',
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Mobile-first PWA shell
  return (
    <div className="min-h-screen bg-white max-w-md mx-auto relative">
      {children}
    </div>
  )
}
