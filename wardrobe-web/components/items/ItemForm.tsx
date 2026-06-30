'use client'

import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  deriveFormality,
  extractItemColor,
  FIT_LABELS,
  FIT_OPTIONS,
  FORMALITY_LABELS,
  FORMALITY_OPTIONS,
  PATTERNS,
  SEASONS,
  SUBTYPES,
  type Category,
  type Fit,
  type Formality,
  type Pattern,
  type Season,
} from '@/lib/items'
import type { ItemFormApi } from '@/hooks/useItemForm'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

const ANY_SUBTYPE = '__any'

const FIT_CATEGORIES = new Set<Category>([
  'top',
  'outerwear',
  'bottom',
  'dress',
])

const SEASON_ICONS: Record<Season, string> = {
  spring: '✿',
  summer: '☀',
  autumn: '❦',
  winter: '❄',
}

const labelCls =
  'mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground'

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

const fitItems = FIT_OPTIONS.map(value => ({
  label: FIT_LABELS[value],
  value,
}))

function formatOption(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function FieldSelect({
  label,
  items,
  value,
  onChange,
}: {
  label: string
  items: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <div className={labelCls}>{label}</div>
      <div className='relative'>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className='w-full cursor-pointer appearance-none rounded-xl border border-input bg-background py-[11px] pr-9 pl-[13px] text-[14.5px] text-foreground shadow-xs/5 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/24'
        >
          {items.map(item => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className='pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground' />
      </div>
    </div>
  )
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span
      className='size-9 rounded-full border-2'
      style={{
        background: color,
        borderColor: 'var(--color-card)',
        boxShadow: '0 0 0 1.5px var(--color-border)',
      }}
      aria-label={label}
    />
  )
}

export function ItemForm({
  form,
  initialImageUrl,
}: {
  form: ItemFormApi
  initialImageUrl?: string | null
}) {
  const { values, patch, toggle } = form
  const [extractingColor, setExtractingColor] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const previewRef = useRef<string | null>(null)
  const shownImage = preview ?? initialImageUrl ?? null

  const showFit = FIT_CATEGORIES.has(values.category)
  const optionCount = 1 + (showFit ? 1 : 0)
  const subtypes = SUBTYPES[values.category]
  const subtypeItems = subtypes
    ? [
        { label: 'Any', value: ANY_SUBTYPE },
        ...subtypes.map(value => ({ label: formatOption(value), value })),
      ]
    : []

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
    if (result) patch({ hex: result.hex, accentHex: result.accentHex ?? null })
    setExtractingColor(false)
  }

  return (
    <div className='flex flex-col'>
      <div className='mb-3.5'>
        <div className={labelCls}>
          Name <span className='text-warning'>*</span>
        </div>
        <Input
          type='text'
          value={values.name}
          onChange={e => patch({ name: e.target.value })}
          placeholder='Converse All Star red'
          className='rounded-xl'
        />
      </div>

      <div className='mb-3 grid grid-cols-2 gap-3'>
        <FieldSelect
          label='Type'
          items={categoryItems}
          value={values.category}
          onChange={value => {
            const category = value as Category
            patch({
              category,
              subType: null,
              formality: deriveFormality(category, null),
              fit: FIT_CATEGORIES.has(category)
                ? (values.fit ?? 'regular')
                : null,
            })
          }}
        />
        <FieldSelect
          label='Pattern'
          items={patternItems}
          value={values.pattern}
          onChange={value => patch({ pattern: value as Pattern })}
        />
      </div>

      <div
        className={cn(
          'mb-3.5 grid gap-3',
          optionCount + (subtypes ? 1 : 0) >= 3
            ? 'grid-cols-3'
            : 'grid-cols-2'
        )}
      >
        <FieldSelect
          label='Formality'
          items={formalityItems}
          value={values.formality ?? 'casual'}
          onChange={value => patch({ formality: value as Formality })}
        />
        {showFit && (
          <FieldSelect
            label='Fit'
            items={fitItems}
            value={values.fit ?? 'regular'}
            onChange={value => patch({ fit: value as Fit })}
          />
        )}
        {subtypes && (
          <FieldSelect
            label='Subtype'
            items={subtypeItems}
            value={values.subType ?? ANY_SUBTYPE}
            onChange={value => {
              const subType = value === ANY_SUBTYPE ? null : value
              patch({
                subType,
                formality: deriveFormality(values.category, subType),
              })
            }}
          />
        )}
      </div>

      <div className='mb-3.5 flex items-stretch gap-3'>
        <div className='min-w-0 flex-1'>
          <div className={labelCls}>
            Photo{' '}
            <span className='font-medium tracking-normal text-muted-foreground/70 normal-case'>
              — color auto-read
            </span>
          </div>
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
              'flex h-[86px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed p-2.5 text-center transition-colors',
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
            {shownImage ? (
              <>
                <span
                  className='size-10 rounded-[11px] border border-border bg-cover bg-center'
                  style={{ backgroundImage: `url(${shownImage})` }}
                />
                <span className='text-[12px] font-semibold text-foreground'>
                  {extractingColor ? 'Reading color…' : 'Tap to replace'}
                </span>
              </>
            ) : (
              <>
                <span className='flex size-[30px] items-center justify-center rounded-[9px] bg-muted text-[15px] text-muted-foreground'>
                  ▦
                </span>
                <span className='text-[12.5px] font-semibold text-foreground'>
                  Drop a photo{' '}
                  <span className='font-medium text-muted-foreground'>or</span>{' '}
                  browse
                </span>
              </>
            )}
          </label>
        </div>

        <div className='w-[166px] flex-none'>
          <div className={labelCls}>
            Color{' '}
            <span className='font-medium tracking-normal text-muted-foreground/70 normal-case'>
              · main + accent
            </span>
          </div>
          <div className='flex gap-2 rounded-xl border border-border bg-card p-3'>
            <label className='flex flex-1 cursor-pointer flex-col items-center gap-1.5'>
              <Swatch color={values.hex} label='Main color' />
              <span className='text-[10px] font-bold tracking-wide text-muted-foreground'>
                MAIN
              </span>
              <input
                type='color'
                aria-label='Main color'
                value={values.hex}
                onChange={e => patch({ hex: e.target.value })}
                className='sr-only'
              />
            </label>

            <span className='w-px flex-none bg-border' />

            {values.accentHex ? (
              <div className='relative flex flex-1 flex-col items-center gap-1.5'>
                <label className='flex cursor-pointer'>
                  <Swatch color={values.accentHex} label='Accent color' />
                  <input
                    type='color'
                    aria-label='Accent color'
                    value={values.accentHex}
                    onChange={e => patch({ accentHex: e.target.value })}
                    className='sr-only'
                  />
                </label>
                <span className='text-[10px] font-bold tracking-wide text-muted-foreground'>
                  ACCENT
                </span>
                <button
                  type='button'
                  onClick={() => patch({ accentHex: null })}
                  aria-label='Remove accent'
                  className='absolute -top-1.5 left-1/2 ml-2 flex size-[18px] items-center justify-center rounded-full border border-card bg-muted text-[11px] text-muted-foreground'
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className='flex flex-1 cursor-pointer flex-col items-center gap-1.5'>
                <span className='flex size-9 items-center justify-center rounded-full border-[1.5px] border-dashed border-border text-[16px] text-muted-foreground'>
                  +
                </span>
                <span className='text-[10px] font-bold tracking-wide text-muted-foreground'>
                  ACCENT
                </span>
                <input
                  type='color'
                  aria-label='Add accent color'
                  value='#7a2230'
                  onChange={e => patch({ accentHex: e.target.value })}
                  className='sr-only'
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className={labelCls}>
        When to wear <span className='text-warning'>*</span>
      </div>
      <div className='grid grid-cols-4 gap-2'>
        {SEASONS.map(season => {
          const on = values.seasonWear.includes(season)
          return (
            <button
              key={season}
              type='button'
              onClick={() => toggle('seasonWear', season)}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-semibold transition-colors',
                on
                  ? 'border-transparent bg-foreground text-white'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              )}
            >
              <span className='text-[14px] leading-none'>
                {SEASON_ICONS[season]}
              </span>
              {formatOption(season)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
