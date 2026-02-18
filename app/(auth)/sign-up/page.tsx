import Link from 'next/link'
import { signup } from './actions'

interface SignUpPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams
  const error = params.error

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-base text-gray-500">Start using StreetNotes today</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-base text-red-700">{decodeURIComponent(error)}</p>
          </div>
        )}

        <form className="flex flex-col gap-4" action={signup}>
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
              autoComplete="new-password"
              className="min-h-[44px] rounded-md border border-gray-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            className="min-h-[44px] w-full rounded-md bg-black text-white text-base font-medium hover:bg-gray-800"
          >
            Create account
          </button>
        </form>

        <p className="text-center text-base text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-black font-medium underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
