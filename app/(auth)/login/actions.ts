'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function toUserMessage(error: { message: string; code?: string | null }): string {
  if (error.code === 'over_email_send_rate_limit') {
    return 'Too many sign-up emails were sent recently. Please wait and try again, or disable email confirmation in Supabase for local testing.'
  }

  if (error.message === 'Email not confirmed') {
    return 'Your email is not confirmed yet. Check your inbox, then sign in again.'
  }

  if (error.message === 'Invalid login credentials') {
    return 'Invalid email or password.'
  }

  return error.message
}

export async function login(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) {
    redirect(`/login?error=${encodeURIComponent(toUserMessage(error))}`)
  }
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(toUserMessage(error))}`)
  }

  // If email confirmation is enabled, Supabase creates a user but no session.
  if (!data.session) {
    redirect(
      '/login?message=Check+your+email+to+confirm+your+account+before+signing+in.'
    )
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
