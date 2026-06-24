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

function pairAvg(ids: string[], map: MatchMap): number {
  let sum = 0
  let n = 0
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const s = map[ids[i]]?.[ids[j]] ?? map[ids[j]]?.[ids[i]]
      if (s != null) {
        sum += s
        n += 1
      }
    }
  }
  return n ? Math.round(sum / n) : 0
}

function harmonyWord(h: number): string {
  return h >= 24 ? 'In harmony' : h >= 18 ? 'Balanced' : 'Some clash'
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
  const harmony = pairAvg(selectedIds, map)
  const hasHarmony = selectedIds.length >= 2

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

  let suggestion = 'Pick items to build your look.'
  if (hasHarmony) {
    let best: { label: string; name: string; d: number } | null = null
    for (const lane of lanes) {
      for (const cand of lane.items) {
        if (cand.id === selByCat.get(lane.cat)) continue
        const others = selectedIds.filter(
          id => byId.get(id)?.category !== lane.cat
        )
        const h2 = pairAvg([...others, cand.id], map)
        const d = h2 - harmony
        if (d > 0 && (!best || d > best.d)) {
          best = { label: lane.label, name: cand.name, d }
        }
      }
    }
    suggestion = best
      ? `Try ${best.label} → ${best.name}  ·  +${best.d} harmony`
      : 'This look is dialled in — nice.'
  }

  return (
    <div className='rounded-[20px] border border-border bg-card pt-6 pb-2 shadow-sm'>
      <style>{`.ds-lane::-webkit-scrollbar{height:0}`}</style>

      <div className='flex items-end justify-between gap-6 px-6'>
        <div>
          <div className='font-heading text-[22px] font-bold tracking-tight'>
            Today&apos;s look
          </div>
          <div className='mt-0.5 text-[13.5px] text-muted-foreground'>
            {suggestion}
          </div>
        </div>
        {hasHarmony && (
          <div
            className='flex-none rounded-[15px] px-[18px] py-3 text-white shadow-md'
            style={{ background: getMatchScoreTone(harmony).solidColor }}
          >
            <div className='text-[11px] font-semibold tracking-widest uppercase opacity-85'>
              Harmony
            </div>
            <div className='mt-0.5 flex items-baseline gap-1.5'>
              <span className='font-heading text-[30px] leading-none font-extrabold'>
                {harmony}
              </span>
              <span className='text-sm opacity-80'>/ 36</span>
            </div>
            <div className='mt-0.5 text-[12.5px] font-semibold'>
              {harmonyWord(harmony)}
            </div>
          </div>
        )}
      </div>

      <div className='mt-4 flex flex-col'>
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
                      disabled={inactive}
                      onClick={() => onSelect(item)}
                      aria-label={item.name}
                      className='relative block size-24 overflow-hidden rounded-[14px] p-0'
                      style={{
                        background: item.color.hex,
                        border: '1px solid var(--border)',
                        cursor: inactive ? 'default' : 'pointer',
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
