import { useCallback, useMemo, useState } from 'react'

const KEY = 'dress:excluded'

function load(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(raw)
      ? raw.filter((x): x is string => typeof x === 'string')
      : []
  } catch {
    return []
  }
}

export function useExcluded() {
  const [ids, setIds] = useState<string[]>(load)

  const toggle = useCallback((id: string) => {
    const current = load()
    const next = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id]
    setIds(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY, JSON.stringify(next))
    }
  }, [])

  const excludedIds = useMemo(() => new Set(ids), [ids])

  return { excludedIds, toggle }
}
