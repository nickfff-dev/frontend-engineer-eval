'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Unauthenticated() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-slate-100 p-4 rounded-full">
              <Lock className="w-8 h-8 text-slate-900" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Authentication Required
          </h1>
          <p className="text-slate-600 mb-8">
            You need to sign in to access this page. Please log in to continue.
          </p>

          <Link href="/login" className="inline-block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Go to Login
            </Button>
          </Link>

          <p className="text-sm text-slate-500 mt-6">
            Don&apos;t have an account? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
