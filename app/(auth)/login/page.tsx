import Link from 'next/link'
import { login } from './actions'
import GoogleSignInButton from '@/components/google-sign-in-button'

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const error = params.error
  const message = params.message

  return (
    <main
      id="main-content"
      className="flex min-h-[calc(100dvh-72px)] flex-col justify-center px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-5"
    >
      <div className="flex w-full flex-col gap-5">
        {/* Headline */}
        <div className="flex flex-col gap-2">
          <span className="fg-eyebrow">Field Glow</span>
          <h1 className="fg-title mt-2">
            Sign in
          </h1>
          <p className="fg-subtitle">
            Welcome back. Capture the visit, review the result, keep moving.
          </p>
        </div>

        <div className="fg-card p-5">
          {error && (
            <div
              role="alert"
              className="fg-inset mb-4 px-4 py-3"
            >
              <p className="text-sm font-extrabold text-[#8B6B40]">
                {decodeURIComponent(error)}
              </p>
            </div>
          )}

          {message && (
            <div
              role="status"
              className="fg-card-sm mb-4 px-4 py-3"
            >
              <p className="text-sm font-extrabold text-[#8B6B40]">
                {decodeURIComponent(message)}
              </p>
            </div>
          )}

          <form className="flex flex-col gap-3" action={login}>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-extrabold text-[#3D332A]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="fg-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-extrabold text-[#3D332A]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                className="fg-input"
              />
            </div>

            <button type="submit" className="fg-action mt-2">
              Sign in
            </button>
          </form>

          <div
            className="my-4 flex items-center gap-3"
            role="separator"
            aria-orientation="horizontal"
          >
            <div className="h-px flex-1 bg-[#A8855A]/30" aria-hidden="true" />
            <span className="text-xs font-extrabold text-[#3D332A]">
              Or
            </span>
            <div className="h-px flex-1 bg-[#A8855A]/30" aria-hidden="true" />
          </div>

          <GoogleSignInButton />
        </div>

        <div className="flex flex-col items-center gap-2 text-center text-sm font-medium text-[#3D332A]">
          <span>New here?</span>
          <Link href="/sign-up" className="fg-secondary-action px-5">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  )
}
