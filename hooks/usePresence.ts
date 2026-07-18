import { useEffect, useState } from 'react'

export function usePresence(open: boolean, duration = 300) {
  const [rendered, setRendered] = useState(open)

  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setRendered(true))
      return () => cancelAnimationFrame(raf)
    }
    const timer = window.setTimeout(() => setRendered(false), duration)
    return () => window.clearTimeout(timer)
  }, [open, duration])

  return { rendered: rendered || open, state: open ? 'in' : 'out' } as const
}
