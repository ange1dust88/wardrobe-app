'use client'

import {
  CATEGORIES,
  CATEGORY_LABELS,
  getItemImageSrc,
  type Item,
  type MatchMap,
} from '@/lib/items'
import { getMatchScoreTone } from '@/lib/match-score'

type Props = {
  items: Item[]
  selectedIds: string[]
  map: MatchMap
  onSelect: (item: Item) => void
}

export function OutfitCarousel({ items, selectedIds, map, onSelect }: Props) {
  const byId = new Map(items.map(i => [i.id, i]))
  const selectedSet = new Set(selectedIds)
  const selByCat = new Map<string, string>()
  for (const id of selectedIds) {
    const it = byId.get(id)
    if (it) selByCat.set(it.category, id)
  }

  const building = selectedIds.length > 0

  function fit(item: Item): number {
    let sum = 0
    let n = 0
    for (const id of selectedIds) {
      const sel = byId.get(id)
      if (!sel || sel.category === item.category) continue
      const s = map[item.id]?.[id] ?? map[id]?.[item.id] ?? 0
      sum += s
      n += 1
    }
    return n ? Math.round(sum / n) : 0
  }

  const lanes = CATEGORIES.filter(cat => items.some(i => i.category === cat)).map(
    cat => ({
      cat,
      label: CATEGORY_LABELS[cat],
      items: items.filter(i => i.category === cat),
      selName: byId.get(selByCat.get(cat) ?? '')?.name ?? '',
    })
  )

  return (
    <div className='rounded-[20px] border border-border bg-card pb-2 shadow-sm'>
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
                const selected = selectedSet.has(item.id)
                const img = getItemImageSrc(item)
                const f = fit(item)
                const inactive = building && !selected && f === 0
                const showChip = !selected && building && f > 0
                return (
                  <div
                    key={item.id}
                    className='w-24 flex-none'
                    style={{
                      opacity: inactive ? 0.4 : 1,
                      filter: inactive ? 'grayscale(1)' : 'none',
                    }}
                  >
                    <button
                      type='button'
                      onClick={() => onSelect(item)}
                      aria-label={item.name}
                      className='relative block size-24 overflow-hidden rounded-[14px] p-0'
                      style={{
                        background: item.color.hex,
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        transform: selected ? 'translateY(-2px)' : 'none',
                        boxShadow: selected
                          ? '0 0 0 2px var(--card), 0 0 0 4px #3d5a3d, 0 8px 20px rgba(0,0,0,.16)'
                          : '0 1px 3px rgba(0,0,0,.08)',
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
                        <span className='absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-[#3d5a3d] text-[13px] text-white shadow'>
                          ✓
                        </span>
                      )}
                      {showChip && (
                        <span
                          className='font-heading absolute bottom-1.5 left-1.5 rounded-md px-1.5 text-[12px] font-bold text-white shadow'
                          style={{ background: getMatchScoreTone(f).solidColor }}
                        >
                          {f}
                        </span>
                      )}
                    </button>
                    <div
                      className='mt-2 text-center text-xs leading-tight font-medium'
                      style={{ color: selected ? 'var(--foreground)' : 'var(--muted-foreground)' }}
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
