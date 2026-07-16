'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'

export function LoginScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const isSignin = mode === 'signin'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setPending(true)
    const result = isSignin
      ? await signIn(email, password)
      : await signUp(email, password)
    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsConfirmation) {
      setInfo('Check your email to confirm, then sign in.')
      setMode('signin')
    }
  }

  function toggleMode() {
    setMode(isSignin ? 'signup' : 'signin')
    setError(null)
    setInfo(null)
  }

  return (
    <main className='flex min-h-svh flex-col items-center justify-center bg-background px-6 py-12 text-foreground'>
      <div className='rise-in flex w-full max-w-[400px] flex-col items-center'>
        <div className='mb-7 flex size-[52px] items-center justify-center rounded-[15px] bg-foreground'>
          <span
            className='size-[11px] rounded-full'
            style={{ background: '#7fae7f' }}
          />
        </div>

        <h1 className='font-heading text-center text-[32px] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-[38px]'>
          {isSignin ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className='mt-3 text-center text-[15.5px] text-muted-foreground'>
          {isSignin
            ? 'Sign in to your wardrobe.'
            : 'Start building your wardrobe.'}
        </p>

        <form onSubmit={submit} className='mt-8 flex w-full flex-col gap-3.5'>
          <label className='flex flex-col gap-1.5'>
            <span className='font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase'>
              Email
            </span>
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='you@example.com'
              autoComplete='email'
              className='rounded-[12px] border border-border bg-card px-4 py-3 text-[15px] transition-colors outline-none placeholder:text-muted-foreground/70 focus:border-foreground'
            />
          </label>
          <label className='flex flex-col gap-1.5'>
            <span className='font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase'>
              Password
            </span>
            <input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
              autoComplete={isSignin ? 'current-password' : 'new-password'}
              className='rounded-[12px] border border-border bg-card px-4 py-3 text-[15px] transition-colors outline-none placeholder:text-muted-foreground/70 focus:border-foreground'
            />
          </label>

          {error && (
            <div className='rounded-[11px] border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-[13px] text-destructive'>
              {error}
            </div>
          )}
          {info && (
            <div className='rounded-[11px] border border-border bg-secondary/60 px-3.5 py-2.5 text-[13px] text-foreground'>
              {info}
            </div>
          )}

          <button
            type='submit'
            disabled={!email || !password || pending}
            className='mt-1 flex min-h-[48px] items-center justify-center rounded-[13px] bg-foreground px-6 text-[15px] font-semibold text-background transition-[transform,opacity] enabled:hover:-translate-y-0.5 disabled:opacity-50'
          >
            {pending ? (
              <span className='size-[18px] animate-spin rounded-full border-2 border-background/30 border-t-background' />
            ) : isSignin ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <button
          type='button'
          onClick={toggleMode}
          className='mt-6 text-[14px] text-muted-foreground transition-colors hover:text-foreground'
        >
          {isSignin ? 'No account? ' : 'Have an account? '}
          <span className='font-semibold text-foreground underline underline-offset-[3px]'>
            {isSignin ? 'Sign up' : 'Sign in'}
          </span>
        </button>
      </div>
    </main>
  )
}
