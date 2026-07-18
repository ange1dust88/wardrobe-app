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

  const write = useCallback((next: string[]) => {
    setIds(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY, JSON.stringify(next))
    }
  }, [])

  const toggle = useCallback(
    (id: string) => {
      const current = load()
      write(
        current.includes(id) ? current.filter(x => x !== id) : [...current, id]
      )
    },
    [write]
  )

  const restore = useCallback(
    (id: string) => write(load().filter(x => x !== id)),
    [write]
  )

  const restoreAll = useCallback(() => write([]), [write])

  const hideMany = useCallback(
    (add: string[]) => write([...new Set([...load(), ...add])]),
    [write]
  )

  const excludedIds = useMemo(() => new Set(ids), [ids])

  return { excludedIds, toggle, restore, restoreAll, hideMany }
}

export type ExcludedApi = ReturnType<typeof useExcluded>
