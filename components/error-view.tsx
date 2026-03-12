'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ErrorOccurred() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-b from-slate-50 to-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
            <AlertTriangle className="h-8 w-8 text-rose-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Something Went Wrong
        </h1>

        <p className="text-slate-600 mb-8 leading-relaxed">
          We encountered an unexpected error while processing your request.
          Please try again or return to the home page.
        </p>

        <Link href="/">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Return to Home
          </Button>
        </Link>

        <p className="text-slate-500 text-sm mt-6">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
