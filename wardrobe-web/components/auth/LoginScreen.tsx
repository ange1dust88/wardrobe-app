'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from '@/components/ui/frame'
import { Input } from '@/components/ui/input'

export function LoginScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setPending(true)
    const result =
      mode === 'signin'
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

  return (
    <main className='mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-16'>
      <Frame>
        <FramePanel>
          <FrameHeader>
            <FrameTitle className='font-heading text-2xl'>
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </FrameTitle>
            <FrameDescription>Your wardrobe, just for you.</FrameDescription>
          </FrameHeader>
        </FramePanel>
        <FramePanel>
          <form onSubmit={submit} className='flex flex-col gap-4'>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='you@example.com'
                autoComplete='email'
              />
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='••••••••'
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
              />
            </Field>

            {error && (
              <Alert variant='error'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {info && (
              <Alert>
                <AlertDescription>{info}</AlertDescription>
              </Alert>
            )}

            <Button
              type='submit'
              disabled={!email || !password}
              loading={pending}
            >
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </Button>
          </form>

          <button
            type='button'
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setInfo(null)
            }}
            className='mt-3 w-full text-center text-sm text-muted-foreground underline'
          >
            {mode === 'signin'
              ? 'No account? Sign up'
              : 'Have an account? Sign in'}
          </button>
        </FramePanel>
      </Frame>
    </main>
  )
}
