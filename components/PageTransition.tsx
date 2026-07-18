'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className='page-in flex min-h-full flex-col'>
      {children}
    </div>
  )
}
