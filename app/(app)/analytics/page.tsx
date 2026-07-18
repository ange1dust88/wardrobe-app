'use client'

import { useMemo, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useAppContext } from '@/components/AppContext'
import { EditItemModal } from '@/components/items/EditItemModal'
import { GarmentLoader } from '@/components/GarmentLoader'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  getItemImageSrc,
  type Category,
  type Item,
  type PreviewItemBody,
  type Season,
} from '@/lib/items'
import { SCORE_TIER_COLORS, getMatchScoreTone } from '@/lib/match-score'
import { harmonyOf } from '@/lib/harmony'
import { useItems } from '@/hooks/useItems'
import { useMatchMap } from '@/hooks/useMatchMap'
import { useMatchPreview } from '@/hooks/useMatchPreview'
import { useOutfits } from '@/hooks/useOutfits'
import { useProfile } from '@/hooks/useProfile'
import type { Who } from '@/lib/onboarding'

const CORE: Category[] = ['top', 'bottom', 'shoes']

const ALL_SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']

function SuggestionGain({
  category,
  swatch,
  gainColor,
  colorType,
}: {
  category: Category
  swatch: string
  gainColor: string
  colorType: string | null
}) {
  const body = useMemo<PreviewItemBody>(
    () => ({
      category,
      hex: swatch,
      accentHex: null,
      pattern: 'solid',
      formality: null,
      fit: null,
      seasonWear: ALL_SEASONS,
    }),
    [category, swatch]
  )
  const { data, isFetching } = useMatchPreview(body, colorType)
  const label = data
    ? `pairs with ${data.matchCount}`
    : isFetching
      ? 'scoring…'
      : '—'
  return (
    <span
      className='flex items-center gap-1.5 text-[12.5px] font-bold'
      style={{ color: gainColor }}
    >
      ↗ {label}
    </span>
  )
}

function shopUrl(who: Who | null, terms: string): string {
  const g = who === 'men' ? "men's " : who === 'women' ? "women's " : ''
  const q = `${g}${terms}`.trim()
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`
}

function Heading({
  title,
  sub,
  right,
}: {
  title: string
  sub?: string
  right?: React.ReactNode
}) {
  return (
    <div className='flex items-baseline justify-between gap-4'>
      <div>
        <div className='font-heading text-[22px] font-extrabold tracking-[-0.02em]'>
          {title}
        </div>
        {sub && (
          <div className='mt-0.5 text-[13.5px] text-muted-foreground'>
            {sub}
          </div>
        )}
      </div>
      {right}
    </div>
  )
}

export default function AnalyticsPage() {
  const { colorType } = useAppContext()
  const { itemsQuery, updateMutation, deleteMutation } = useItems()
  const { outfitsQuery } = useOutfits()
  const { profileQuery } = useProfile()
  const who = profileQuery.data?.who ?? null
  const matchMap = useMatchMap(colorType, true)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data])
  const outfits = useMemo(() => outfitsQuery.data ?? [], [outfitsQuery.data])

  const a = useMemo(() => {
    const map = matchMap.data ?? {}
    const cnt = (c: Category) => items.filter(i => i.category === c).length
    const usedIds = new Set(outfits.flatMap(o => o.itemIds))
    const unworn = items.filter(i => !usedIds.has(i.id))

    const harmonies = outfits
      .map(o => harmonyOf(o.itemIds, map))
      .filter((h): h is number => h != null)
    const avgHarmony = harmonies.length
      ? Math.round(harmonies.reduce((s, h) => s + h, 0) / harmonies.length)
      : 0

    const shown = CATEGORIES.filter(c => cnt(c) > 0 || CORE.includes(c))
    const maxCat = Math.max(1, ...shown.map(cnt))
    const catBars = shown.map(c => {
      const n = cnt(c)
      const thin = n <= 1
      return {
        c,
        label: CATEGORY_LABELS[c],
        n,
        note: thin
          ? 'thin — worth growing'
          : n === maxCat
            ? 'best stocked'
            : '',
        thin,
        pct: Math.round((n / maxCat) * 100),
      }
    })

    const isAccent = (i: Item) => i.wardrobeRole === 'pop'
    const unwornAccents = unworn.filter(isAccent)
    const tops = cnt('top')

    const sug: {
      title: string
      tag: string
      swatch: string
      category: Category
      reason: string
      gainColor: string
      query: string
    }[] = []
    if (cnt('bottom') <= 2) {
      sug.push({
        title: 'A neutral bottom',
        tag: `Bottom · ${cnt('bottom') === 0 ? 'missing' : 'thin'}`,
        swatch: '#8a8f7e',
        category: 'bottom',
        reason: `Only ${cnt('bottom')} bottom${cnt('bottom') === 1 ? '' : 's'} on hand — a neutral trouser stretches across the most looks.`,
        gainColor: SCORE_TIER_COLORS.great,
        query: 'neutral tapered trousers',
      })
    }
    if (cnt('shoes') <= 2) {
      sug.push({
        title: 'Another pair of shoes',
        tag: `Shoes · ${cnt('shoes') === 0 ? 'missing' : 'thin'}`,
        swatch: '#6f665c',
        category: 'shoes',
        reason: `${cnt('shoes')} pair${cnt('shoes') === 1 ? '' : 's'} so far — a versatile neutral pair finishes more outfits.`,
        gainColor: SCORE_TIER_COLORS.works,
        query: 'minimal leather sneakers',
      })
    }
    if (cnt('outerwear') === 0 && tops > 0) {
      sug.push({
        title: 'A light overshirt',
        tag: 'Layer · missing',
        swatch: '#3d4a5c',
        category: 'outerwear',
        reason: `No outer layer yet — one neutral overshirt layers over your ${tops} top${tops === 1 ? '' : 's'} and stretches looks into cooler weather.`,
        gainColor: SCORE_TIER_COLORS.perfect,
        query: 'neutral overshirt jacket',
      })
    }
    if (unwornAccents.length >= 1) {
      sug.push({
        title: 'A neutral bridge piece',
        tag: 'Pairing · unlock',
        swatch: '#d8d4cc',
        category: 'top',
        reason: `${unwornAccents.length} bold piece${unwornAccents.length === 1 ? '' : 's'} sit unused — a plain neutral partner gives them something to pair with.`,
        gainColor: SCORE_TIER_COLORS.works,
        query: 'plain neutral crew t-shirt',
      })
    }

    const tierColor = getMatchScoreTone(avgHarmony).solidColor
    const stats = [
      {
        value: items.length,
        label: 'Pieces owned',
        color: 'var(--foreground)',
      },
      {
        value: outfits.length,
        label: 'Saved looks',
        color: 'var(--foreground)',
      },
      {
        value: avgHarmony || '—',
        label: 'Avg harmony',
        color: avgHarmony ? tierColor : 'var(--muted-foreground)',
      },
      {
        value: unworn.length,
        label: 'Never worn',
        color: unworn.length
          ? SCORE_TIER_COLORS.works
          : SCORE_TIER_COLORS.great,
      },
    ]

    return { stats, catBars, unworn, sug }
  }, [items, outfits, matchMap.data])

  if (itemsQuery.isLoading || matchMap.isLoading) {
    return (
      <div className='flex min-h-[calc(100svh-232px)] items-center justify-center'>
        <GarmentLoader label='crunching your wardrobe' />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className='flex min-h-[calc(100svh-232px)] flex-col items-center justify-center gap-2 px-6 text-center'>
        <div className='font-heading text-[20px] font-bold'>
          Nothing to analyse yet
        </div>
        <div className='text-[14px] text-muted-foreground'>
          Add a few pieces and your wardrobe stats show up here.
        </div>
      </div>
    )
  }

  return (
    <div className='px-6 pt-4 pb-24 sm:px-12'>
      <div className='max-w-[900px]'>
        {/* STAT BAND */}
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          {a.stats.map(s => (
            <div
              key={s.label}
              className='rounded-[18px] border border-border bg-card p-5 shadow-[0_4px_16px_rgba(20,28,36,0.05)]'
            >
              <div
                className='font-heading text-[32px] leading-none font-extrabold tracking-[-0.03em]'
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className='mt-1.5 text-[12.5px] font-medium text-muted-foreground'>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* BY CATEGORY */}
        <div className='mt-9'>
          <Heading
            title='Your wardrobe by category'
            right={
              <span className='text-[12.5px] text-muted-foreground'>
                {items.length} pieces total
              </span>
            }
          />
          <div className='mt-5 flex flex-col gap-4'>
            {a.catBars.map(b => (
              <div key={b.c}>
                <div className='mb-2 flex items-baseline justify-between'>
                  <div className='text-[14px] font-semibold'>
                    {b.label}{' '}
                    <span className='font-mono text-[12px] text-muted-foreground'>
                      {b.n}
                    </span>
                  </div>
                  {b.note && (
                    <div
                      className='font-mono text-[12px]'
                      style={{
                        color: b.thin
                          ? SCORE_TIER_COLORS.works
                          : 'var(--muted-foreground)',
                      }}
                    >
                      {b.note}
                    </div>
                  )}
                </div>
                <div className='h-3 overflow-hidden rounded-[7px] bg-secondary'>
                  <div
                    className='h-full rounded-[7px] transition-[width] duration-500'
                    style={{
                      width: `${Math.max(b.pct, b.n > 0 ? 5 : 0)}%`,
                      background: b.thin ? '#c79a2e' : 'var(--foreground)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GATHERING DUST */}
        <div className='mt-10'>
          <Heading
            title='Gathering dust'
            sub='Pieces in no saved outfit yet — put them to work.'
            right={
              <span
                className='font-mono text-[13px] font-semibold'
                style={{ color: SCORE_TIER_COLORS.works }}
              >
                {a.unworn.length} unworn
              </span>
            }
          />
          {a.unworn.length === 0 ? (
            <div
              className='mt-4 rounded-[16px] border p-5 text-[14px] font-semibold'
              style={{
                background: 'color-mix(in srgb, #2f7d4f 8%, var(--card))',
                borderColor: 'color-mix(in srgb, #2f7d4f 22%, var(--card))',
                color: SCORE_TIER_COLORS.great,
              }}
            >
              Nice — every piece is in at least one look.
            </div>
          ) : (
            <div className='mt-5 flex flex-wrap gap-[18px]'>
              {a.unworn.map(item => {
                const img = getItemImageSrc(item)
                return (
                  <div key={item.id} className='w-[120px]'>
                    <button
                      type='button'
                      onClick={() => setEditingItem(item)}
                      className='relative flex size-[120px] items-center justify-center overflow-hidden rounded-[18px] border border-border bg-card p-0 shadow-[0_4px_14px_rgba(30,40,50,0.07)] transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(30,40,50,0.12)]'
                    >
                      <span
                        className='block size-[66px] rounded-[13px]'
                        style={{ background: item.color.hex }}
                      >
                        {img && (
                          <img
                            src={img}
                            alt=''
                            className='size-full rounded-[13px] object-cover'
                          />
                        )}
                      </span>
                      <span
                        className='font-mono absolute top-2 right-2 rounded-[6px] px-1.5 py-[3px] text-[8.5px] tracking-[0.06em]'
                        style={{
                          background:
                            'color-mix(in srgb, #a68117 14%, transparent)',
                          color: '#8a6b12',
                        }}
                      >
                        0 wears
                      </span>
                    </button>
                    <div className='mt-2 text-center text-[12.5px] leading-tight font-semibold text-foreground'>
                      {item.name}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* WORTH ADDING */}
        {a.sug.length > 0 && (
          <div className='mt-10'>
            <Heading
              title='Worth adding'
              sub='Gaps we spotted — each would unlock new pairings.'
            />
            <div className='mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {a.sug.map(g => (
                <div
                  key={g.title}
                  className='flex flex-col gap-3 rounded-[18px] border border-border bg-card p-5 shadow-[0_4px_16px_rgba(20,28,36,0.05)]'
                >
                  <div className='flex items-center gap-3'>
                    <span
                      className='size-10 flex-none rounded-[11px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.07)]'
                      style={{ background: g.swatch }}
                    />
                    <div className='min-w-0'>
                      <div className='truncate text-[15px] font-bold tracking-[-0.01em]'>
                        {g.title}
                      </div>
                      <div className='font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase'>
                        {g.tag}
                      </div>
                    </div>
                  </div>
                  <div className='text-[13.5px] leading-relaxed text-muted-foreground'>
                    {g.reason}
                  </div>
                  <div className='mt-auto flex items-center justify-between gap-2'>
                    <SuggestionGain
                      category={g.category}
                      swatch={g.swatch}
                      gainColor={g.gainColor}
                      colorType={colorType}
                    />
                    <a
                      href={shopUrl(who, g.query)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex flex-none items-center gap-1.5 rounded-[10px] bg-foreground px-3 py-2 text-[12.5px] font-semibold text-background transition-transform hover:scale-[1.03]'
                    >
                      <ShoppingBag className='size-[14px]' /> Shop
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editingItem && (
        <EditItemModal
          key={editingItem.id}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={(id, body, callbacks) =>
            updateMutation.mutate({ id, body }, callbacks)
          }
          onDelete={(id, callbacks) => deleteMutation.mutate(id, callbacks)}
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
