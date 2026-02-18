import Link from 'next/link'
import { login } from './actions'
import GoogleSignInButton from '@/components/google-sign-in-button'

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const error = params.error

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-base text-gray-500">Welcome back to StreetNotes</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-base text-red-700">{decodeURIComponent(error)}</p>
          </div>
        )}

        <form className="flex flex-col gap-4" action={login}>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-base font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="min-h-[44px] rounded-md border border-gray-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-base font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              className="min-h-[44px] rounded-md border border-gray-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            className="min-h-[44px] w-full rounded-md bg-black text-white text-base font-medium hover:bg-gray-800"
          >
            Sign in
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-base text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <GoogleSignInButton />

        <p className="text-center text-base text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-black font-medium underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
