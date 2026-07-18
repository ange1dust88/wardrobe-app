import { useSyncExternalStore } from 'react'

const QUERY = '(hover: none) and (pointer: coarse)'

export function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    cb => {
      const mq = window.matchMedia(QUERY)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}
