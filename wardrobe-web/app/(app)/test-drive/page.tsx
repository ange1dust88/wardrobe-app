'use client'

import { Camera, ChevronDownIcon, Plus, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppContext } from '@/components/AppContext'
import { GarmentLoader } from '@/components/GarmentLoader'
import { AddItemModal } from '@/components/items/AddItemModal'
import { EditItemModal } from '@/components/items/EditItemModal'
import { ItemViewModal } from '@/components/items/ItemViewModal'
import { useItems } from '@/hooks/useItems'
import { useMatchPreview } from '@/hooks/useMatchPreview'
import { notifyError, notifySuccess } from '@/lib/toast'
import {
  API_URL,
  CATEGORIES,
  CATEGORY_LABELS,
  FIT_LABELS,
  FIT_OPTIONS,
  FORMALITY_LABELS,
  FORMALITY_OPTIONS,
  PATTERNS,
  SEASONS,
  extractItemColor,
  type Category,
  type CreateItem,
  type Fit,
  type Formality,
  type Item,
  type MatchPreview,
  type MatchPreviewPair,
  type MatchPreviewSlot,
  type Pattern,
  type PreviewItemBody,
  type Season,
} from '@/lib/items'
import {
  MIN_RECOMMENDABLE_SCORE,
  SCORE_TIER_COLORS,
  getMatchScoreTone,
  matchScoreToPercentage,
} from '@/lib/match-score'
import { cn } from '@/lib/utils'

const labelCls =
  'mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground'

const FIT_CATEGORIES = new Set<Category>([
  'top',
  'outerwear',
  'bottom',
  'dress',
])

type Spec = {
  category: Category
  hex: string
  accentHex: string | null
  pattern: Pattern
  formality: Formality | null
  fit: Fit | null
  seasonWear: Season[]
}

const DEFAULT_SPEC: Spec = {
  category: 'top',
  hex: '#3a4a5c',
  accentHex: null,
  pattern: 'solid',
  formality: 'casual',
  fit: 'regular',
  seasonWear: [],
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const ESSENTIAL: Record<Category, Category[]> = {
  headwear: [],
  top: ['bottom', 'shoes'],
  outerwear: ['top', 'bottom', 'shoes'],
  dress: ['shoes'],
  bottom: ['top', 'shoes'],
  shoes: ['bottom'],
  accessory: [],
}

function plural(cat: Category): string {
  const label = CATEGORY_LABELS[cat].toLowerCase()
  return label.endsWith('s') ? label : `${label}s`
}

function imgOf(pair: MatchPreviewPair): string | null {
  if (!pair.imageUrl) return null
  return /^(https?:|data:|blob:)/.test(pair.imageUrl)
    ? pair.imageUrl
    : `${API_URL}${pair.imageUrl}`
}

function Sel({
  label,
  value,
  onChange,
  items,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  items: { label: string; value: string }[]
}) {
  return (
    <div>
      <div className={labelCls}>{label}</div>
      <div className='relative'>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className='h-11 w-full cursor-pointer appearance-none rounded-xl border border-input bg-background pr-9 pl-[13px] text-[14.5px] text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/24'
        >
          {items.map(it => (
            <option key={it.value} value={it.value}>
              {it.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className='pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground/70' />
      </div>
    </div>
  )
}

function verdictOf(d: MatchPreview): {
  label: string
  blurb: string
  color: string
} {
  const avgPct = d.avgScore != null ? matchScoreToPercentage(d.avgScore) : 0
  if (d.wardrobeSize === 0) {
    return {
      label: 'Nothing to compare',
      blurb: 'Your wardrobe is empty — add a few pieces first.',
      color: 'var(--muted-foreground)',
    }
  }
  if (d.matchCount === 0) {
    return {
      label: 'Skip it',
      blurb: 'Nothing you own pairs cleanly with this — it would sit unused.',
      color: SCORE_TIER_COLORS.works,
    }
  }
  if (d.matchCount >= 6 && avgPct >= 72) {
    return {
      label: 'Strong buy',
      blurb: `Pairs with ${d.matchCount} of your ${d.wardrobeSize} pieces at ${avgPct}% avg — it will earn its place.`,
      color: SCORE_TIER_COLORS.perfect,
    }
  }
  if (d.matchCount >= 3) {
    return {
      label: 'Worth it',
      blurb: `${d.matchCount} solid pairings at ${avgPct}% avg — a safe, versatile add.`,
      color: SCORE_TIER_COLORS.great,
    }
  }
  return {
    label: 'Only if you love it',
    blurb: `Just ${d.matchCount} pairing${d.matchCount === 1 ? '' : 's'} so far — a statement piece, not a workhorse.`,
    color: SCORE_TIER_COLORS.works,
  }
}

function ItemCard({
  pair,
  muted,
  onClick,
}: {
  pair: MatchPreviewPair
  muted?: boolean
  onClick?: () => void
}) {
  const img = imgOf(pair)
  const tone = getMatchScoreTone(pair.score)
  return (
    <div>
      <div
        onClick={onClick}
        className={cn(
          'relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[15px] border border-border bg-card shadow-[0_3px_12px_rgba(30,40,50,0.06)]',
          onClick &&
            'cursor-pointer transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(30,40,50,0.12)]'
        )}
      >
        {img ? (
          <img src={img} alt='' className='size-full object-cover' />
        ) : (
          <span
            className='size-[52%] rounded-[11px]'
            style={{ background: pair.hex }}
          />
        )}
        <span
          className='font-mono absolute top-1.5 right-1.5 rounded-[6px] px-1.5 py-[3px] text-[10px] font-bold'
          style={{
            background: muted
              ? 'color-mix(in srgb, var(--muted-foreground) 16%, var(--card))'
              : `color-mix(in srgb, ${tone.solidColor} 16%, var(--card))`,
            color: muted ? 'var(--muted-foreground)' : tone.solidColor,
          }}
        >
          {matchScoreToPercentage(pair.score)}%
        </span>
      </div>
      <div
        className={cn(
          'mt-2 truncate text-center text-[12.5px] font-semibold',
          muted ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {pair.name}
      </div>
      <div className='font-mono mt-0.5 truncate text-center text-[9px] tracking-[0.06em] text-muted-foreground/80'>
        {CATEGORY_LABELS[pair.category]}
      </div>
    </div>
  )
}

function Results({
  data,
  category,
  onAdd,
  onView,
}: {
  data: MatchPreview
  category?: Category
  onAdd: () => void
  onView: (id: string, score: number) => void
}) {
  const verdict = verdictOf(data)
  const fits = data.results.filter(r => r.score >= MIN_RECOMMENDABLE_SCORE)
  const weak = data.results.filter(r => r.score < MIN_RECOMMENDABLE_SCORE)
  const avgPct =
    data.avgScore != null ? matchScoreToPercentage(data.avgScore) : 0

  const slotByCat = new Map(data.byCategory.map(s => [s.category, s]))
  const essentialGaps = (category ? ESSENTIAL[category] : [])
    .map(c => slotByCat.get(c))
    .filter((s): s is MatchPreviewSlot => s != null && s.matches === 0)

  return (
    <div className='rise-in flex flex-col gap-6'>
      <div
        className='rounded-[16px] border p-5'
        style={{
          borderColor: `color-mix(in srgb, ${verdict.color} 30%, var(--card))`,
          background: `color-mix(in srgb, ${verdict.color} 8%, var(--card))`,
        }}
      >
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
          <div>
            <div
              className='font-heading text-[28px] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-[34px]'
              style={{ color: verdict.color }}
            >
              {verdict.label}
            </div>
            <div className='mt-3 max-w-[560px] text-[15px] leading-relaxed text-foreground/80'>
              {verdict.blurb}
            </div>
          </div>
          <button
            type='button'
            onClick={onAdd}
            className='flex h-10 flex-none items-center justify-center gap-1.5 self-start rounded-[10px] bg-foreground px-4 text-[13.5px] font-semibold text-background transition-colors hover:bg-foreground/90'
          >
            <Plus className='size-4' /> Add to wardrobe
          </button>
        </div>
        {data.wardrobeSize > 0 && (
          <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground'>
            <span>
              {data.matchCount} of {data.wardrobeSize} pieces pair
            </span>
            {data.avgScore != null && (
              <span>
                avg{' '}
                <span
                  className='font-bold'
                  style={{ color: getMatchScoreTone(data.avgScore).solidColor }}
                >
                  {avgPct}%
                </span>
              </span>
            )}
            {data.skipped > 0 && (
              <span>{data.skipped} skipped (season / type clash)</span>
            )}
          </div>
        )}
      </div>

      {fits.length > 0 && (
        <div>
          <div className='mb-3 flex items-baseline gap-2'>
            <span className='font-heading text-[16px] font-bold'>
              Works with
            </span>
            <span
              className='font-mono text-[12px] font-semibold'
              style={{ color: SCORE_TIER_COLORS.great }}
            >
              {fits.length}
            </span>
          </div>
          <div className='grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(104px,1fr))]'>
            {fits.map(p => (
              <ItemCard
                key={p.id}
                pair={p}
                onClick={() => onView(p.id, p.score)}
              />
            ))}
          </div>
        </div>
      )}

      {weak.length > 0 && (
        <div>
          <div className='mb-3 flex items-baseline gap-2'>
            <span className='font-heading text-[16px] font-bold'>
              Won&rsquo;t really carry
            </span>
            <span className='font-mono text-[12px] font-semibold text-muted-foreground'>
              {weak.length}
            </span>
          </div>
          <div className='grid gap-3.5 opacity-[0.62] [grid-template-columns:repeat(auto-fill,minmax(104px,1fr))] [filter:grayscale(0.4)]'>
            {weak.map(p => (
              <ItemCard
                key={p.id}
                pair={p}
                muted
                onClick={() => onView(p.id, p.score)}
              />
            ))}
          </div>
        </div>
      )}

      {essentialGaps.length > 0 && (
        <div
          className='rounded-[16px] border px-5 py-4 text-[13.5px] leading-relaxed'
          style={{
            borderColor: `color-mix(in srgb, ${SCORE_TIER_COLORS.works} 28%, var(--card))`,
            background: `color-mix(in srgb, ${SCORE_TIER_COLORS.works} 8%, var(--card))`,
          }}
        >
          <span
            className='font-semibold'
            style={{ color: SCORE_TIER_COLORS.works }}
          >
            Little to wear it with
          </span>{' '}
          <span className='text-muted-foreground'>
            —{' '}
            {essentialGaps
              .map(s =>
                s.owned === 0
                  ? `no ${plural(s.category)}`
                  : `no matching ${plural(s.category)}`
              )
              .join(' · ')}
          </span>
        </div>
      )}
    </div>
  )
}

export default function TestDrivePage() {
  const { colorType } = useAppContext()
  const { itemsQuery, createMutation, updateMutation, deleteMutation } =
    useItems()
  const [spec, setSpec] = useState<Spec>(DEFAULT_SPEC)
  const [reading, setReading] = useState(false)
  const [submitted, setSubmitted] = useState<PreviewItemBody | null>(null)
  const [runKey, setRunKey] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [viewing, setViewing] = useState<{ item: Item; score: number } | null>(
    null
  )
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  const itemById = useMemo(
    () => new Map((itemsQuery.data ?? []).map(i => [i.id, i])),
    [itemsQuery.data]
  )

  const patch = (p: Partial<Spec>) => setSpec(s => ({ ...s, ...p }))
  const showFit = FIT_CATEGORIES.has(spec.category)
  const canRun = spec.seasonWear.length > 0

  const currentBody = useMemo<PreviewItemBody>(
    () => ({
      category: spec.category,
      hex: spec.hex,
      accentHex: spec.accentHex,
      pattern: spec.pattern,
      formality: spec.formality,
      fit: showFit ? spec.fit : null,
      seasonWear: spec.seasonWear,
    }),
    [spec, showFit]
  )
  const currentKey = JSON.stringify(currentBody)
  const dirty = submitted != null && runKey !== currentKey

  const { data, isFetching } = useMatchPreview(submitted, colorType)

  function run() {
    if (!canRun) return
    setSubmitted(currentBody)
    setRunKey(currentKey)
    setRunning(true)
    window.setTimeout(() => setRunning(false), 650)
  }

  async function onPhoto(file: File | null) {
    if (!file) return
    setReading(true)
    const result = await extractItemColor(file).catch(() => null)
    if (result) {
      patch({ hex: result.hex, accentHex: result.accentHex ?? null })
    } else {
      notifyError('Could not read the photo', 'Pick a color by hand instead.')
    }
    setReading(false)
  }

  const loading = submitted != null && (running || (isFetching && !data))

  const prefill = useMemo<CreateItem | null>(() => {
    if (!submitted) return null
    return {
      name: '',
      category: submitted.category,
      subType: null,
      formality: submitted.formality ?? null,
      fit: submitted.fit ?? null,
      hex: submitted.hex,
      accentHex: submitted.accentHex ?? null,
      pattern: submitted.pattern,
      seasonWear: submitted.seasonWear,
      image: null,
    }
  }, [submitted])

  return (
    <div className='px-6 pt-4 pb-16 sm:px-12'>
      <div className='grid items-start gap-6 lg:grid-cols-[minmax(340px,380px)_1fr]'>
        <div className='self-start rounded-[18px] border border-border bg-card p-5 shadow-[0_4px_16px_rgba(20,28,36,0.05)] lg:sticky lg:top-[84px]'>
          <div className='font-heading mb-4 text-[16px] font-bold tracking-[-0.01em] text-foreground'>
            The piece you&rsquo;re eyeing
          </div>

          <div className='mb-3 grid grid-cols-2 gap-3'>
            <Sel
              label='Type'
              value={spec.category}
              onChange={v => patch({ category: v as Category })}
              items={CATEGORIES.map(c => ({
                label: CATEGORY_LABELS[c],
                value: c,
              }))}
            />
            <Sel
              label='Pattern'
              value={spec.pattern}
              onChange={v => patch({ pattern: v as Pattern })}
              items={PATTERNS.map(p => ({
                label: p.replace(/_/g, ' '),
                value: p,
              }))}
            />
          </div>

          <div className='mb-3 grid grid-cols-2 gap-3'>
            <Sel
              label='Formality'
              value={spec.formality ?? 'casual'}
              onChange={v => patch({ formality: v as Formality })}
              items={FORMALITY_OPTIONS.map(f => ({
                label: FORMALITY_LABELS[f],
                value: f,
              }))}
            />
            {showFit && (
              <Sel
                label='Fit'
                value={spec.fit ?? 'regular'}
                onChange={v => patch({ fit: v as Fit })}
                items={FIT_OPTIONS.map(f => ({
                  label: FIT_LABELS[f],
                  value: f,
                }))}
              />
            )}
          </div>

          <div className='mb-3.5'>
            <div className={labelCls}>Color</div>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border bg-background p-3'>
              <label className='flex cursor-pointer items-center gap-2'>
                <span
                  className='size-9 rounded-full border-2'
                  style={{
                    background: spec.hex,
                    borderColor: 'var(--color-card)',
                    boxShadow: '0 0 0 1.5px var(--color-border)',
                  }}
                />
                <span className='text-[11px] font-bold tracking-wide text-muted-foreground'>
                  MAIN
                </span>
                <input
                  type='color'
                  aria-label='Main color'
                  value={spec.hex}
                  onChange={e => patch({ hex: e.target.value })}
                  className='sr-only'
                />
              </label>

              <span className='mx-1 h-8 w-px flex-none bg-border' />

              {spec.accentHex ? (
                <div className='flex items-center gap-2'>
                  <label className='flex cursor-pointer items-center gap-2'>
                    <span
                      className='size-9 rounded-full border-2'
                      style={{
                        background: spec.accentHex,
                        borderColor: 'var(--color-card)',
                        boxShadow: '0 0 0 1.5px var(--color-border)',
                      }}
                    />
                    <span className='text-[11px] font-bold tracking-wide text-muted-foreground'>
                      ACCENT
                    </span>
                    <input
                      type='color'
                      aria-label='Accent color'
                      value={spec.accentHex}
                      onChange={e => patch({ accentHex: e.target.value })}
                      className='sr-only'
                    />
                  </label>
                  <button
                    type='button'
                    onClick={() => patch({ accentHex: null })}
                    aria-label='Remove accent'
                    className='flex size-5 items-center justify-center rounded-full bg-muted text-[11px] text-muted-foreground hover:bg-accent/40'
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className='flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-muted-foreground'>
                  <span className='flex size-6 items-center justify-center rounded-full border-[1.5px] border-dashed border-border'>
                    <Plus className='size-3' />
                  </span>
                  accent
                  <input
                    type='color'
                    aria-label='Add accent color'
                    value='#7a2230'
                    onChange={e => patch({ accentHex: e.target.value })}
                    className='sr-only'
                  />
                </label>
              )}

              <label className='flex cursor-pointer items-center gap-1.5 rounded-[9px] border border-border px-2.5 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-muted sm:ml-auto'>
                <Camera className='size-3.5' />
                {reading ? 'Reading…' : 'Photo'}
                <input
                  type='file'
                  accept='image/jpeg,image/png,image/webp,image/gif,image/avif'
                  className='hidden'
                  onChange={e => onPhoto(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          <div className='mb-4'>
            <div className={labelCls}>
              When you&rsquo;d wear it <span className='text-warning'>*</span>
            </div>
            <div className='flex flex-wrap gap-[9px]'>
              {SEASONS.map(season => {
                const on = spec.seasonWear.includes(season)
                return (
                  <button
                    key={season}
                    type='button'
                    onClick={() =>
                      patch({
                        seasonWear: on
                          ? spec.seasonWear.filter(s => s !== season)
                          : [...spec.seasonWear, season],
                      })
                    }
                    className={cn(
                      'inline-flex h-10 items-center justify-center rounded-[10px] border px-[15px] text-[13px] font-semibold transition-colors',
                      on
                        ? 'border-transparent bg-foreground text-white'
                        : 'border-border bg-background text-foreground hover:bg-muted'
                    )}
                  >
                    {cap(season)}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type='button'
            onClick={run}
            disabled={!canRun}
            className={cn(
              'flex h-[50px] w-full items-center justify-center gap-2 rounded-[10px] text-[15px] font-semibold transition-colors',
              canRun
                ? 'bg-foreground text-background hover:bg-foreground/90'
                : 'cursor-not-allowed bg-muted text-muted-foreground'
            )}
          >
            <Sparkles className='size-[17px]' />
            {submitted ? 'Run again' : 'Run test drive'}
          </button>
          {dirty && (
            <div className='mt-2 text-center text-[11.5px] text-muted-foreground'>
              Inputs changed — run again to update.
            </div>
          )}
          {!canRun && (
            <div className='mt-2 text-center text-[11.5px] text-muted-foreground'>
              Pick at least one season to run.
            </div>
          )}
        </div>

        <div className='min-h-[300px]'>
          {!submitted ? (
            <div className='flex min-h-[520px] flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-border px-6 text-center sm:px-10'>
              <span className='mb-3 flex size-[54px] items-center justify-center rounded-[15px] bg-secondary text-muted-foreground'>
                <Sparkles className='size-[26px]' />
              </span>
              <div className='font-heading text-[25px] font-extrabold tracking-[-0.02em] text-balance'>
                Thinking of buying something?
              </div>
              <div className='max-w-[440px] text-[15px] leading-relaxed text-balance text-muted-foreground'>
                Describe it on the left — color, type, seasons — then hit{' '}
                <span className='font-semibold text-foreground'>Run</span>. It
                gets scored against every piece you own.
              </div>
            </div>
          ) : loading ? (
            <div className='flex min-h-[520px] items-center justify-center'>
              <GarmentLoader label='scoring against your wardrobe' />
            </div>
          ) : data ? (
            <Results
              data={data}
              category={submitted?.category}
              onAdd={() => setAddOpen(true)}
              onView={(id, score) => {
                const item = itemById.get(id)
                if (item) setViewing({ item, score })
              }}
            />
          ) : null}
        </div>
      </div>

      {addOpen && prefill && (
        <AddItemModal
          open
          initial={prefill}
          onClose={() => {
            setAddOpen(false)
            createMutation.reset()
          }}
          onSubmit={(values, callbacks) =>
            createMutation.mutate(values, {
              onSuccess: () => {
                callbacks.onSuccess()
                notifySuccess('Added to wardrobe')
              },
            })
          }
          pending={createMutation.isPending}
          errorMessage={
            createMutation.error
              ? (createMutation.error as Error).message
              : undefined
          }
        />
      )}

      {viewing && (
        <ItemViewModal
          key={viewing.item.id}
          item={viewing.item}
          matchScore={viewing.score}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditingItem(viewing.item)
            setViewing(null)
          }}
        />
      )}

      {editingItem && (
        <EditItemModal
          key={editingItem.id}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={(id, body, callbacks) =>
            updateMutation.mutate({ id, body }, callbacks)
          }
          onDelete={(id, callbacks) =>
            deleteMutation.mutate(id, {
              ...callbacks,
              onError: err =>
                notifyError('Could not delete item', (err as Error).message),
            })
          }
          pending={updateMutation.isPending}
          deleting={deleteMutation.isPending}
          errorMessage={
            updateMutation.error
              ? (updateMutation.error as Error).message
              : undefined
          }
        />
      )}
    </div>
  )
}
