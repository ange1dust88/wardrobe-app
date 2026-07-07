'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center'>
      <div className='font-heading text-[22px] font-bold tracking-tight'>
        Something went wrong
      </div>
      <p className='max-w-sm text-sm text-muted-foreground'>
        An unexpected error occurred. Try again — if it keeps happening, reload
        the page.
      </p>
      <button
        type='button'
        onClick={reset}
        className='rounded-xl bg-foreground px-5 py-2.5 text-[14px] font-semibold text-background'
      >
        Try again
      </button>
    </div>
  )
}
