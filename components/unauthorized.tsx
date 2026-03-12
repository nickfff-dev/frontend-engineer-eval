'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-rose-100 p-4 rounded-full">
              <ShieldAlert className="w-8 h-8 text-rose-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Access Denied
          </h1>
          <p className="text-slate-600 mb-8">
            You don&apos;t have permission to access this page. If you believe this is a mistake, please contact your administrator.
          </p>

          <Link href="/dashboard" className="inline-block">
            <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white">
              Back to Dashboard
            </Button>
          </Link>

          <p className="text-sm text-slate-500 mt-6">
            Need help? Contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  )
}
