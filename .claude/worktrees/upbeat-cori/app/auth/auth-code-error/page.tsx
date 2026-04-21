import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-bold">Sign in failed</h1>
        <p className="text-gray-500">
          Something went wrong during sign in. Please try again.
        </p>
        <Link
          href="/login"
          className="min-h-[44px] flex items-center justify-center rounded-md bg-black text-white text-base font-medium px-4"
        >
          Back to login
        </Link>
      </div>
    </main>
  )
}
