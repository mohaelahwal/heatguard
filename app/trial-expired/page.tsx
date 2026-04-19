'use client'

import { HeatGuardLogo } from '@/components/HeatGuardLogo'

export default function TrialExpiredPage() {
  return (
    <div className="min-h-screen bg-[#0B281F] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">

        <div className="flex flex-col items-center mb-8">
          <HeatGuardLogo className="w-12 h-12 mx-auto mb-4 opacity-60" />
          <h1 className="text-2xl font-bold text-white tracking-tight">HeatGuard<sup className="text-[10px] align-super">®</sup></h1>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Trial Period Expired</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Your 3-day HeatGuard demo access has ended. Contact our team to upgrade your account and continue protecting your workforce.
          </p>

          <a
            href="mailto:moha@heatguard.ae?subject=Upgrade%20Request%20-%20HeatGuard%20Trial%20Expired"
            className="block w-full h-11 bg-[#00D15A] hover:bg-[#00b84f] text-white rounded-full font-semibold text-sm leading-[44px] shadow-[0_4px_16px_rgba(0,209,90,0.3)] transition-colors"
          >
            Contact Sales to Upgrade
          </a>

          <button
            onClick={() => {
              localStorage.removeItem('dashboard_session')
              window.location.href = '/login'
            }}
            className="block w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}
