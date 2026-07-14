'use client'

import { EyeOffIcon, PencilIcon } from 'lucide-react'
import { useState } from 'react'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  getItemImageSrc,
  type Item,
  type ScoreBreakdown,
} from '@/lib/items'
import { getMatchScoreTone } from '@/lib/match-score'
import { BRAND_ACCENT } from '@/lib/theme'
import { useCoarsePointer } from '@/hooks/useCoarsePointer'
import { ScoreBadge } from './ScoreBadge'
import { ScoreDetail } from './ScoreDetail'
import { TileMenu } from './TileMenu'

type Props = {
  items: Item[]
  selectedIds: string[]
  activeId: string | null
  matchedIds: Set<string>
  scoreById: Record<string, number>
  breakdownById?: Record<string, ScoreBreakdown>
  excludedIds?: Set<string>
  filterMatchIds?: Set<string> | null
  onHover: (id: string | null) => void
  onSelect: (item: Item) => void
  onEdit: (item: Item) => void
  onToggleExclude: (item: Item) => void
}

type Detail = { id: string; left: number; y: number; flipUp: boolean }

export function OutfitCarousel({
  items,
  selectedIds,
  activeId,
  matchedIds,
  scoreById,
  breakdownById = {},
  excludedIds = new Set(),
  filterMatchIds = null,
  onHover,
  onSelect,
  onEdit,
  onToggleExclude,
}: Props) {
  const coarse = useCoarsePointer()
  const [detail, setDetail] = useState<Detail | null>(null)

  const byId = new Map(items.map(i => [i.id, i]))
  const selectedSet = new Set(selectedIds)
  const selByCat = new Map<string, string>()
  for (const id of selectedIds) {
    const it = byId.get(id)
    if (it) selByCat.set(it.category, id)
  }

  const building = selectedIds.length > 0

  const lanes = CATEGORIES.filter(cat =>
    items.some(i => i.category === cat && !excludedIds.has(i.id))
  ).map(cat => ({
    cat,
    label: CATEGORY_LABELS[cat],
    items: items.filter(i => i.category === cat && !excludedIds.has(i.id)),
    selName: byId.get(selByCat.get(cat) ?? '')?.name ?? '',
  }))

  function toggleDetail(id: string, el: HTMLElement) {
    const r = el.getBoundingClientRect()
    const flipUp = r.bottom > window.innerHeight - 260
    setDetail(d =>
      d?.id === id
        ? null
        : { id, left: r.left, y: flipUp ? r.top : r.bottom, flipUp }
    )
  }

  return (
    <div className='w-full' onMouseLeave={() => onHover(null)}>
      <style>{`.ds-lane::-webkit-scrollbar{height:0}`}</style>

      <div className='flex flex-col'>
        {lanes.map(lane => (
          <div key={lane.cat} className='border-t border-border py-[18px]'>
            <div className='flex items-baseline gap-3 px-2 pb-3'>
              <div className='font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase'>
                {lane.label}
              </div>
              {lane.selName && (
                <div className='text-[11.5px] text-muted-foreground'>
                  in look ·{' '}
                  <span className='font-semibold text-foreground'>
                    {lane.selName}
                  </span>
                </div>
              )}
            </div>
            <div className='ds-lane flex gap-5 overflow-x-auto px-2 pt-3 pb-2'>
              {lane.items.map(item => {
                const isExcluded = excludedIds.has(item.id)
                const selected = selectedSet.has(item.id)
                const isMatch = matchedIds.has(item.id)
                const isHover = item.id === activeId
                const score = scoreById[item.id]
                const breakdown = breakdownById[item.id]
                const lit =
                  !isExcluded &&
                  (building
                    ? selected || isMatch
                    : !activeId || isHover || isMatch)
                const dimByFilter =
                  filterMatchIds != null &&
                  !filterMatchIds.has(item.id) &&
                  !activeId &&
                  !building
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
                    className='w-32 flex-none'
                    onMouseEnter={() => onHover(item.id)}
                    onMouseLeave={() => onHover(null)}
                    style={{
                      opacity: dimByFilter ? 0.2 : lit ? 1 : 0.4,
                      filter: dimByFilter || !lit ? 'grayscale(1)' : 'none',
                      transition: 'opacity .25s ease, filter .25s ease',
                    }}
                  >
                    <div className='relative'>
                      <button
                        type='button'
                        onClick={() => {
                          if (isExcluded && !selected) return
                          onSelect(item)
                        }}
                        aria-label={item.name}
                        className='relative block size-32 overflow-hidden rounded-[12px] p-0'
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
                      </button>

                      {!coarse && isHover && (
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

                      {!coarse && isHover && !selected && (
                        <button
                          type='button'
                          onClick={e => {
                            e.stopPropagation()
                            onToggleExclude(item)
                          }}
                          aria-label='Hide from wheel'
                          title='Hide from wheel'
                          className='absolute -top-1 -right-1 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground'
                        >
                          <EyeOffIcon className='size-3' />
                        </button>
                      )}

                      {!coarse && isMatch && breakdown && isHover && (
                        <button
                          type='button'
                          onClick={e => {
                            e.stopPropagation()
                            toggleDetail(item.id, e.currentTarget)
                          }}
                          aria-label='Why this score'
                          className='absolute -right-1 -bottom-1 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-background text-[12px] font-bold text-muted-foreground shadow-sm hover:text-foreground'
                        >
                          ?
                        </button>
                      )}

                      {coarse && !isExcluded && (
                        <TileMenu
                          canHide={!selected}
                          breakdown={isMatch ? breakdown : null}
                          onEdit={() => onEdit(item)}
                          onHide={() => onToggleExclude(item)}
                        />
                      )}
                    </div>
                    <div className='mt-2.5 text-center text-[12.5px] leading-tight font-semibold text-foreground'>
                      {item.name}
                    </div>
                    {item.subType && (
                      <div className='font-mono mt-0.5 text-center text-[9.5px] tracking-[0.05em] text-muted-foreground uppercase'>
                        {item.subType}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {detail && breakdownById[detail.id] && (
        <>
          <button
            type='button'
            aria-hidden
            tabIndex={-1}
            onClick={() => setDetail(null)}
            className='fixed inset-0 z-40 cursor-default'
          />
          <div
            className='fixed z-50'
            style={{
              left: detail.left,
              top: detail.y,
              transform: detail.flipUp
                ? 'translateY(calc(-100% - 8px))'
                : 'translateY(8px)',
            }}
          >
            <ScoreDetail breakdown={breakdownById[detail.id]} />
          </div>
        </>
      )}
    </div>
  )
}
