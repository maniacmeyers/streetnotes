'use client'

export default function WaitlistForm({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  return (
    <div>
      <form
        action="#"
        className="flex border-4 border-black neo-shadow bg-white"
      >
        <input
          type="email"
          name="email"
          placeholder="YOUR WORK EMAIL"
          required
          className="flex-1 px-4 py-4 font-mono text-sm text-black placeholder:text-gray-400 uppercase tracking-wider bg-white outline-none"
        />
        <button
          type="submit"
          className="border-l-4 border-black bg-black text-white font-display text-lg sm:text-xl px-6 py-4 uppercase hover:bg-white hover:text-black transition-colors duration-100 cursor-pointer whitespace-nowrap"
        >
          Join Waitlist
        </button>
      </form>
      <p className={`font-mono text-sm sm:text-base uppercase tracking-[0.15em] font-bold ${variant === 'dark' ? 'text-volt' : 'text-black'} mt-4`}>
        {variant === 'dark' ? '★ Free early access. No credit card. ★' : '★ Early access is free. Be first. ★'}
      </p>
    </div>
  )
}
