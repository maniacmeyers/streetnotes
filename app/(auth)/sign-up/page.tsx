import Link from 'next/link'
import { signup } from './actions'
import { BrutalCard, BrutalButton, BrutalInput } from '@/components/streetnotes/brutal'

interface SignUpPageProps {
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams
  const error = params.error
  const message = params.message

  return (
    <main
      id="main-content"
      className="flex min-h-[100dvh] flex-col items-center justify-center px-4 sm:px-6 py-10"
    >
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex">
          <span className="sticker -rotate-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold">
            Join the beta
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h1
            className="font-display uppercase text-[44px] sm:text-[64px] leading-[0.85] text-white"
            style={{ textShadow: '4px 4px 0px #000000' }}
          >
            Get <span className="text-volt">Started</span>
          </h1>
          <p className="font-body text-base italic text-gray-300">
            Stop losing deals in the parking lot.
          </p>
        </div>

        <BrutalCard variant="white" padded>
          {error && (
            <div
              role="alert"
              className="mb-4 bg-red-100 border-4 border-red-600 px-4 py-3"
            >
              <p className="font-mono text-xs uppercase tracking-wider text-red-700 font-bold">
                {decodeURIComponent(error)}
              </p>
            </div>
          )}

          {message && (
            <div
              role="status"
              className="mb-4 bg-volt/20 border-4 border-volt px-4 py-3"
            >
              <p className="font-mono text-xs uppercase tracking-wider text-black font-bold">
                {decodeURIComponent(message)}
              </p>
            </div>
          )}

          <form className="flex flex-col gap-4" action={signup}>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] font-bold text-black"
              >
                Email
              </label>
              <BrutalInput
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] font-bold text-black"
              >
                Password
              </label>
              <BrutalInput
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <BrutalButton type="submit" variant="volt" size="lg" className="w-full mt-2">
              Create account →
            </BrutalButton>
          </form>
        </BrutalCard>

        <p className="text-center font-mono text-xs uppercase tracking-wider text-gray-400">
          Already signed up?{' '}
          <Link href="/login" className="text-volt font-bold underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
