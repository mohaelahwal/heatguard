'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function TrialGuard() {
  const router = useRouter()

  useEffect(() => {
    try {
      const requests: { status: string; expiresAt?: number; email?: string }[] =
        JSON.parse(localStorage.getItem('pendingRequests') ?? '[]')

      // Find the most-recently approved entry for the mock session user
      const approved = requests.find(r => r.status === 'approved' && r.expiresAt)

      if (approved?.expiresAt && Date.now() > approved.expiresAt) {
        router.replace('/trial-expired')
      }
    } catch {
      // If localStorage is unavailable (SSR hydration edge), do nothing
    }
  }, [router])

  return null
}
