import { useState } from 'react'
import type { CreateItem } from '../lib/items'

type ArrayField = 'vibe' | 'seasonWear'

const EMPTY_FORM: CreateItem = {
  name: '',
  category: 'top',
  subType: null,
  hex: '#000000',
  pattern: 'solid',
  vibe: [],
  seasonWear: [],
  image: null,
}

export function useItemForm(initial?: CreateItem) {
  const [values, setValues] = useState<CreateItem>(initial ?? EMPTY_FORM)
  const [fileInputKey, setFileInputKey] = useState(0)

  function patch(p: Partial<CreateItem>) {
    setValues(v => ({ ...v, ...p }))
  }

  function toggle(field: ArrayField, value: string) {
    setValues(v => {
      const current = v[field] as string[]
      const next = current.includes(value)
        ? current.filter(x => x !== value)
        : [...current, value]
      return { ...v, [field]: next }
    })
  }

  function reset() {
    setValues(initial ?? EMPTY_FORM)
    setFileInputKey(key => key + 1)
  }

  const isValid =
    values.name.trim().length > 0 &&
    values.vibe.length > 0 &&
    values.seasonWear.length > 0

  return { values, patch, toggle, reset, isValid, fileInputKey }
}

export type ItemFormApi = ReturnType<typeof useItemForm>
