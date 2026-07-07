'use client'

import { EyeOffIcon, PencilIcon } from 'lucide-react'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  getItemImageSrc,
  type Item,
} from '@/lib/items'
import { getMatchScoreTone } from '@/lib/match-score'
import { BRAND_ACCENT } from '@/lib/theme'
import { ScoreBadge } from './ScoreBadge'

type Props = {
  items: Item[]
  selectedIds: string[]
  activeId: string | null
  matchedIds: Set<string>
  scoreById: Record<string, number>
  onHover: (id: string | null) => void
  onSelect: (item: Item) => void
  onEdit: (item: Item) => void
}

export function OutfitCarousel({
  items,
  selectedIds,
  activeId,
  matchedIds,
  scoreById,
  onHover,
  onSelect,
  onEdit,
}: Props) {
  const byId = new Map(items.map(i => [i.id, i]))
  const selectedSet = new Set(selectedIds)
  const selByCat = new Map<string, string>()
  for (const id of selectedIds) {
    const it = byId.get(id)
    if (it) selByCat.set(it.category, id)
  }

  const building = selectedIds.length > 0

  const lanes = CATEGORIES.filter(cat =>
    items.some(i => i.category === cat)
  ).map(cat => ({
    cat,
    label: CATEGORY_LABELS[cat],
    items: items.filter(i => i.category === cat),
    selName: byId.get(selByCat.get(cat) ?? '')?.name ?? '',
  }))

  return (
    <div
      className='rounded-[20px] border border-border bg-card pb-2 shadow-sm'
      onMouseLeave={() => onHover(null)}
    >
      <style>{`.ds-lane::-webkit-scrollbar{height:0}`}</style>

      <div className='flex flex-col'>
        {lanes.map(lane => (
          <div key={lane.cat} className='border-t border-border py-3.5'>
            <div className='flex items-baseline justify-between px-6 pb-3'>
              <div className='text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase'>
                {lane.label}
              </div>
              <div className='text-xs text-muted-foreground'>{lane.selName}</div>
            </div>
            <div className='ds-lane flex gap-4 overflow-x-auto px-6 pt-3 pb-2'>
              {lane.items.map(item => {
                const isExcluded = !!item.excluded
                const selected = selectedSet.has(item.id)
                const isMatch = matchedIds.has(item.id)
                const isHover = item.id === activeId
                const score = scoreById[item.id]
                const lit =
                  !isExcluded &&
                  (building
                    ? selected || isMatch
                    : !activeId || isHover || isMatch)
                const img = getItemImageSrc(item)
                const tone =
                  isMatch && score != null ? getMatchScoreTone(score) : null

                const boxShadow = selected
                  ? `0 0 0 2px var(--card), 0 0 0 4px ${BRAND_ACCENT}, 0 8px 20px rgba(0,0,0,.16)`
                  : isHover
                    ? `0 0 0 2px var(--card), 0 0 0 3px var(--foreground), 0 6px 16px rgba(0,0,0,.15)`
                    : tone
                      ? `0 0 0 2px var(--card), 0 0 0 3px ${tone.solidColor}, 0 4px 12px rgba(0,0,0,.12)`
                      : '0 1px 3px rgba(0,0,0,.08)'

                return (
                  <div
                    key={item.id}
                    className='w-24 flex-none'
                    onMouseEnter={() => onHover(item.id)}
                    onMouseLeave={() => onHover(null)}
                    style={{
                      opacity: lit ? 1 : 0.4,
                      filter: lit ? 'none' : 'grayscale(1)',
                      transition: 'opacity .25s ease, filter .25s ease',
                    }}
                  >
                    <div className='relative'>
                      <button
                        type='button'
                        onClick={() => {
                          if (isExcluded) return
                          onSelect(item)
                        }}
                        aria-label={item.name}
                        className='relative block size-24 overflow-hidden rounded-[14px] p-0'
                        style={{
                          background: item.color.hex,
                          border: '1px solid var(--border)',
                          cursor: isExcluded ? 'default' : 'pointer',
                          transform:
                            selected || isHover ? 'translateY(-2px)' : 'none',
                          boxShadow,
                          transition: 'box-shadow .2s ease, transform .2s ease',
                        }}
                      >
                        {img && (
                          <img
                            src={img}
                            alt=''
                            className='absolute inset-0 h-full w-full object-cover'
                          />
                        )}
                        {selected && (
                          <span
                            className='absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full text-[13px] text-white shadow'
                            style={{ background: BRAND_ACCENT }}
                          >
                            ✓
                          </span>
                        )}
                        {isMatch && !selected && score != null && (
                          <ScoreBadge
                            score={score}
                            variant='chip'
                            className='absolute bottom-1.5 left-1.5'
                          />
                        )}
                        {isExcluded && (
                          <span
                            className='absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-foreground/70 text-white shadow'
                            title='Excluded from matching'
                          >
                            <EyeOffIcon className='size-3.5' />
                          </span>
                        )}
                      </button>

                      {isHover && (
                        <button
                          type='button'
                          onClick={e => {
                            e.stopPropagation()
                            onEdit(item)
                          }}
                          aria-label={`Edit ${item.name}`}
                          className='absolute -top-1 -left-1 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm'
                        >
                          <PencilIcon className='size-3' />
                        </button>
                      )}
                    </div>
                    <div
                      className='mt-2 text-center text-xs leading-tight font-medium'
                      style={{
                        color: selected
                          ? 'var(--foreground)'
                          : 'var(--muted-foreground)',
                      }}
                    >
                      {item.name}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
