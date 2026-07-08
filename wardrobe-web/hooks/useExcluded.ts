import { useCallback, useMemo, useState } from 'react'

const KEY = 'dress:excluded'
const TTL = 15 * 60 * 1000

type Store = Record<string, number>

function load(): Store {
  if (typeof window === 'undefined') return {}
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store
    const now = Date.now()
    const fresh: Store = {}
    for (const [id, exp] of Object.entries(raw)) {
      if (typeof exp === 'number' && exp > now) fresh[id] = exp
    }
    return fresh
  } catch {
    return {}
  }
}

export function useExcluded() {
  const [store, setStore] = useState<Store>(load)

  const toggle = useCallback((id: string) => {
    const next = { ...load() }
    if (next[id]) delete next[id]
    else next[id] = Date.now() + TTL
    setStore(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY, JSON.stringify(next))
    }
  }, [])

  const excludedIds = useMemo(() => new Set(Object.keys(store)), [store])

  return { excludedIds, toggle }
}
