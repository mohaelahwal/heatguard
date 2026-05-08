'use client'

import { useEffect } from 'react'

export function TrialGuard() {
  useEffect(() => {
    // Clear any stale mock pendingRequests data from localStorage.
    // Expiry is enforced server-side in the dashboard layout via demo_requests.
    try { localStorage.removeItem('pendingRequests') } catch { /* ignore */ }
  }, [])

  return null
}
