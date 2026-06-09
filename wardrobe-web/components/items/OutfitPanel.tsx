'use client'

import { useState } from 'react'
import { getItemImageSrc, type Item } from '@/lib/items'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type Props = {
  items: Item[]
  onRemove: (id: string) => void
  onClear: () => void
  onSave: (name: string) => void
  saving?: boolean
  errorMessage?: string
}

export function OutfitPanel({
  items,
  onRemove,
  onClear,
  onSave,
  saving,
  errorMessage,
}: Props) {
  const [name, setName] = useState('')
  const canSave = items.length > 0 && name.trim().length > 0

  function handleSave() {
    if (!canSave) return
    onSave(name.trim())
  }

  return (
    <aside className='flex w-full flex-col gap-4 border border-black p-4 lg:w-72'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-medium text-black'>Outfit · {items.length}</h2>
        {items.length > 0 && (
          <button
            type='button'
            onClick={onClear}
            className='text-xs text-black underline'
          >
            Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          Tap items to build an outfit. Matches are highlighted as you add.
        </p>
      ) : (
        <ul className='flex flex-col gap-2'>
          {items.map(item => {
            const imageSrc = getItemImageSrc(item)
            return (
              <li key={item.id} className='flex items-center gap-2'>
                <span
                  className='relative size-9 shrink-0 overflow-hidden border border-black'
                  style={{ backgroundColor: item.color.hex }}
                >
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt=''
                      className='absolute inset-0 h-full w-full object-cover'
                    />
                  )}
                </span>
                <span className='min-w-0 flex-1 truncate text-sm text-black'>
                  {item.name}
                </span>
                <button
                  type='button'
                  onClick={() => onRemove(item.id)}
                  aria-label='Remove'
                  className='text-xs text-black'
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input
          type='text'
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder='Autumn casual'
        />
      </Field>

      {errorMessage && (
        <Alert variant='error'>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleSave} disabled={!canSave} loading={saving}>
        Save outfit
      </Button>
    </aside>
  )
}
