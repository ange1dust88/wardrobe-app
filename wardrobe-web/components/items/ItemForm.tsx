'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  extractItemColor,
  FORMALITY_LABELS,
  FORMALITY_OPTIONS,
  PATTERNS,
  SEASONS,
  STACK_POLICY,
  SUBTYPES,
  VIBES,
  type Category,
  type Formality,
  type Pattern,
  type Season,
} from '@/lib/items'
import type { ItemFormApi } from '@/hooks/useItemForm'
import { findVibeConflicts } from '@/lib/vibe-compat'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ANY_SUBTYPE = '__any'

const SWATCHES = [
  '#1a1815',
  '#6b6457',
  '#b9b2a5',
  '#e7e2d6',
  '#7a2230',
  '#bd8b3e',
  '#3d5a3d',
  '#26303f',
]

const SEASON_ICONS: Record<Season, string> = {
  spring: '✿',
  summer: '☀',
  autumn: '❦',
  winter: '❄',
}

const labelCls =
  'mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground'

const categoryItems = CATEGORIES.map(value => ({
  label: CATEGORY_LABELS[value],
  value,
}))

const patternItems = PATTERNS.map(value => ({
  label: value.replace(/_/g, ' '),
  value,
}))

const formalityItems = FORMALITY_OPTIONS.map(value => ({
  label: FORMALITY_LABELS[value],
  value,
}))

function formatOption(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const chipCls = (on: boolean) =>
  cn(
    'rounded-full border px-[15px] py-2 text-[13px] font-semibold transition-colors',
    on
      ? 'border-transparent bg-foreground text-white'
      : 'border-border bg-background text-foreground hover:bg-muted'
  )

export function ItemForm({ form }: { form: ItemFormApi }) {
  const { values, patch, toggle } = form
  const [extractingColor, setExtractingColor] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const previewRef = useRef<string | null>(null)

  const vibeConflicts = findVibeConflicts(values.vibe)
  const subtypes = SUBTYPES[values.category]
  const subtypeItems = subtypes
    ? [
        { label: 'Any', value: ANY_SUBTYPE },
        ...subtypes.map(value => ({ label: formatOption(value), value })),
      ]
    : []
  const subtypeHint =
    STACK_POLICY[values.category] === 'layered'
      ? 'Lets you layer one of each subtype — a tee under a sweater.'
      : 'Optional — just helps keep your wardrobe organized.'

  const customColor = !SWATCHES.some(
    c => c.toLowerCase() === values.hex.toLowerCase()
  )

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    },
    []
  )

  async function handleImage(file: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const url = file ? URL.createObjectURL(file) : null
    previewRef.current = url
    setPreview(url)
    patch({ image: file })
    if (!file) return
    setExtractingColor(true)
    const result = await extractItemColor(file).catch(() => null)
    if (result) patch({ hex: result.hex })
    setExtractingColor(false)
  }

  return (
    <div className='flex flex-col'>
      <div className='mb-5'>
        <div className={labelCls}>
          Name <span className='text-warning'>*</span>
        </div>
        <Input
          type='text'
          value={values.name}
          onChange={e => patch({ name: e.target.value })}
          placeholder='Black Hooded Jacket'
        />
      </div>

      <div className='mb-5 grid grid-cols-2 gap-4'>
        <div>
          <div className={labelCls}>Type</div>
          <Select
            items={categoryItems}
            value={values.category}
            onValueChange={value =>
              patch({ category: value as Category, subType: null })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectPopup alignItemWithTrigger={false}>
              {categoryItems.map(item => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>
        <div>
          <div className={labelCls}>Pattern</div>
          <Select
            items={patternItems}
            value={values.pattern}
            onValueChange={value => patch({ pattern: value as Pattern })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectPopup alignItemWithTrigger={false}>
              {patternItems.map(item => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>
      </div>

      <div className='mb-5'>
        <div className={labelCls}>Formality</div>
        <Select
          items={formalityItems}
          value={values.formality ?? 'casual'}
          onValueChange={value => patch({ formality: value as Formality })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectPopup alignItemWithTrigger={false}>
            {formalityItems.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </div>

      {subtypes && (
        <div className='mb-5'>
          <div className={labelCls}>Subtype</div>
          <Select
            items={subtypeItems}
            value={values.subType ?? ANY_SUBTYPE}
            onValueChange={value =>
              patch({ subType: value === ANY_SUBTYPE ? null : (value as string) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectPopup alignItemWithTrigger={false}>
              {subtypeItems.map(item => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
          <p className='mt-2 text-[12.5px] leading-snug text-muted-foreground'>
            {subtypeHint}
          </p>
        </div>
      )}

      <div className='mb-6 flex gap-4'>
        <div className='min-w-0 flex-1'>
          <div className={labelCls}>Photo</div>
          <label
            onDragOver={e => {
              e.preventDefault()
              if (!dragging) setDragging(true)
            }}
            onDragLeave={e => {
              e.preventDefault()
              setDragging(false)
            }}
            onDrop={e => {
              e.preventDefault()
              setDragging(false)
              const file = e.dataTransfer.files?.[0]
              if (file) handleImage(file)
            }}
            className={cn(
              'flex h-[118px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-dashed p-3 text-center transition-colors',
              dragging
                ? 'border-foreground bg-muted'
                : 'border-border bg-background hover:bg-muted/50'
            )}
          >
            <input
              key={form.fileInputKey}
              type='file'
              accept='image/jpeg,image/png,image/webp,image/gif'
              className='hidden'
              onChange={e => handleImage(e.target.files?.[0] ?? null)}
            />
            {preview ? (
              <>
                <span
                  className='size-12 rounded-xl border border-border bg-cover bg-center'
                  style={{ backgroundImage: `url(${preview})` }}
                />
                <span className='text-[12.5px] font-semibold text-foreground'>
                  {extractingColor
                    ? 'Reading color…'
                    : 'Photo added · tap to replace'}
                </span>
              </>
            ) : (
              <>
                <span className='flex size-9 items-center justify-center rounded-[11px] bg-muted text-[18px] text-muted-foreground'>
                  ▦
                </span>
                <span className='leading-tight'>
                  <span className='block text-[13px] font-semibold text-foreground'>
                    Drop a photo{' '}
                    <span className='font-medium text-muted-foreground'>or</span>{' '}
                    browse
                  </span>
                  <span className='mt-0.5 block text-[11px] text-muted-foreground'>
                    JPG · PNG · WebP · GIF, up to 5 MB
                  </span>
                </span>
              </>
            )}
          </label>
        </div>

        <div className='w-[132px] flex-none'>
          <div className={labelCls}>Color</div>
          <div className='rounded-2xl border border-border bg-card p-3'>
            <div className='grid grid-cols-4 gap-1.5'>
              {SWATCHES.map(c => {
                const on = !customColor && values.hex.toLowerCase() === c.toLowerCase()
                return (
                  <button
                    key={c}
                    type='button'
                    aria-label={c}
                    onClick={() => patch({ hex: c })}
                    className='aspect-square rounded-lg border border-black/5'
                    style={{
                      background: c,
                      boxShadow: on
                        ? '0 0 0 2px var(--color-card), 0 0 0 4px var(--color-foreground)'
                        : undefined,
                    }}
                  />
                )
              })}
            </div>
            <label className='mt-2.5 flex cursor-pointer items-center gap-2 border-t border-border pt-2.5'>
              <span
                className='inline-block size-[18px] rounded-md border border-black/10'
                style={{
                  background: values.hex,
                  boxShadow: customColor
                    ? '0 0 0 2px var(--color-card), 0 0 0 3px var(--color-foreground)'
                    : undefined,
                }}
              />
              <span className='text-[11.5px] font-semibold text-muted-foreground'>
                Custom
              </span>
              <input
                type='color'
                aria-label='Custom color'
                value={values.hex}
                onChange={e => patch({ hex: e.target.value })}
                className='sr-only'
              />
            </label>
          </div>
        </div>
      </div>

      <div className='mb-6 flex items-center gap-3'>
        <span className={cn(labelCls, 'mb-0')}>Accent</span>
        {values.accentHex ? (
          <>
            <input
              type='color'
              aria-label='Accent color'
              value={values.accentHex}
              onChange={e => patch({ accentHex: e.target.value })}
              className='size-7 cursor-pointer rounded-lg border border-input bg-background p-1'
            />
            <button
              type='button'
              onClick={() => patch({ accentHex: null })}
              className='text-[12.5px] font-semibold text-muted-foreground underline'
            >
              Remove
            </button>
          </>
        ) : (
          <button
            type='button'
            onClick={() => patch({ accentHex: '#888888' })}
            className='text-[12.5px] font-semibold text-foreground underline'
          >
            + Add a second color
          </button>
        )}
        <span className='text-[12px] text-muted-foreground'>optional</span>
      </div>

      <div className='mb-2.5 flex items-baseline justify-between'>
        <div className={cn(labelCls, 'mb-0')}>
          Vibe <span className='text-warning'>*</span>
        </div>
        <span className='text-[12px] text-muted-foreground'>
          {values.vibe.length
            ? `${values.vibe.length} selected`
            : 'pick at least one'}
        </span>
      </div>
      <div className='flex flex-wrap gap-2'>
        {VIBES.map(vibe => (
          <button
            key={vibe}
            type='button'
            onClick={() => toggle('vibe', vibe)}
            className={chipCls(values.vibe.includes(vibe))}
          >
            {formatOption(vibe)}
          </button>
        ))}
      </div>
      {vibeConflicts.length > 0 && (
        <div className='mt-3.5 flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning/8 px-3.5 py-3'>
          <span className='mt-px flex size-[18px] flex-none items-center justify-center rounded-full bg-warning text-[12px] font-bold text-white'>
            !
          </span>
          <span className='text-[12.5px] leading-snug text-foreground'>
            {vibeConflicts.length === 1
              ? 'These vibes pull against each other: '
              : 'These vibe pairs pull against each other: '}
            {vibeConflicts
              .map(([a, b]) => `${formatOption(a)} + ${formatOption(b)}`)
              .join(', ')}{' '}
            — pairing both may read inconsistent.
          </span>
        </div>
      )}

      <div className={cn(labelCls, 'mt-6')}>
        When to wear <span className='text-warning'>*</span>
      </div>
      <div className='grid grid-cols-4 gap-2.5'>
        {SEASONS.map(season => {
          const on = values.seasonWear.includes(season)
          return (
            <button
              key={season}
              type='button'
              onClick={() => toggle('seasonWear', season)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition-colors',
                on
                  ? 'border-transparent bg-foreground text-white'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              )}
            >
              <span className='text-[17px] leading-none'>
                {SEASON_ICONS[season]}
              </span>
              <span className='text-[13px] font-semibold'>
                {formatOption(season)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
