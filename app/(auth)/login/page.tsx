'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      setError('Invalid email or password');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md">
        <div className="flex flex-col space-y-8 p-8">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                ML
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Microlearning</h1>
            </div>
            <p className="text-sm text-slate-600">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-2">
              <Label htmlFor="email" className="text-slate-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="border-slate-300 focus-visible:ring-blue-500"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="password" className="text-slate-900">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="border-slate-300 focus-visible:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo info */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-900">Demo Admin Credentials</p>
            <p className="text-xs text-blue-800 mt-1">
              <strong>Admin:</strong> admin@example.com
            </p>
            <p className="text-xs text-blue-800">
              <strong>Password:</strong> password
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-900">Demo Worker Credentials</p>
            <p className="text-xs text-blue-800 mt-1">
              <strong>Worker:</strong> sarah@example.com
            </p>
            <p className="text-xs text-blue-800">
              <strong>Password:</strong> password2
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
