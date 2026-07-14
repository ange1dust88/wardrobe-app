import { EyeOffIcon, PencilIcon } from 'lucide-react'
import { useState } from 'react'
import { CATEGORIES, getItemImageSrc, type Item } from '../../lib/items'
import {
  getMatchScoreTone,
  matchScoreToPercentage,
} from '../../lib/match-score'
import { BRAND_ACCENT } from '../../lib/theme'
import { cn } from '../../lib/utils'
import type { ScoreBreakdown } from '../../lib/items'
import { useCoarsePointer } from '../../hooks/useCoarsePointer'
import { ScoreDetail } from './ScoreDetail'
import { TileMenu } from './TileMenu'

type Props = {
  items: Item[]
  activeId: string | null
  selectedIds?: string[]
  matchedIds?: Set<string>
  scoreById?: Record<string, number>
  breakdownById?: Record<string, ScoreBreakdown>
  excludedIds?: Set<string>
  matchLoading?: boolean
  filterMatchIds?: Set<string> | null
  onHover: (id: string | null) => void
  onSelect: (item: Item) => void
  onEdit: (item: Item) => void
  onToggleExclude: (item: Item) => void
}

const BOX = 760
const CX = 380
const CY = 380
const R = 270

export function MatchWheel({
  items,
  activeId,
  selectedIds = [],
  matchedIds = new Set(),
  scoreById = {},
  breakdownById = {},
  excludedIds = new Set(),
  matchLoading = false,
  filterMatchIds = null,
  onHover,
  onSelect,
  onEdit,
  onToggleExclude,
}: Props) {
  const [openDetailId, setOpenDetailId] = useState<string | null>(null)
  const coarse = useCoarsePointer()
  const ordered = [...items]
    .filter(i => !excludedIds.has(i.id))
    .sort((a, b) => {
      const ca = CATEGORIES.indexOf(a.category)
      const cb = CATEGORIES.indexOf(b.category)
      return ca !== cb ? ca - cb : a.name.localeCompare(b.name)
    })

  const n = ordered.length
  const indexById: Record<string, number> = {}
  ordered.forEach((it, i) => (indexById[it.id] = i))

  const pos = (i: number) => {
    const ang = ((-90 + i * (360 / n)) * Math.PI) / 180
    return { x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang), ang }
  }

  const crowd = Math.min(1, (2 * Math.PI * R) / (n * 122))
  const sz = Math.round(114 * crowd)
  const szPct = (sz / BOX) * 100

  const active =
    activeId != null ? ordered.find(it => it.id === activeId) : null
  const matchEntries = Object.entries(scoreById)

  const building = selectedIds.length > 0

  let centerTitle = 'Your wardrobe'
  let centerSub = 'hover to bloom its matches'
  if (building && matchEntries.length === 0 && !matchLoading) {
    centerTitle = 'All set'
    centerSub = 'create your outfit →'
  } else if (active) {
    if (excludedIds.has(active.id)) {
      centerTitle = active.name
      centerSub = 'excluded from matching'
    } else if (matchEntries.length) {
      const [topId, topScore] = matchEntries.reduce((a, b) =>
        b[1] > a[1] ? b : a
      )
      centerTitle = active.name
      centerSub = `best · ${ordered.find(it => it.id === topId)?.name} (${topScore})`
    } else {
      centerTitle = active.name
      centerSub = 'no pairings'
    }
  }

  if (matchLoading && matchEntries.length === 0) {
    centerSub = 'reading matches…'
  }

  const sourceIds = building
    ? selectedIds.filter(id => indexById[id] != null)
    : active
      ? [active.id]
      : []

  const arcs = sourceIds.flatMap(srcId => {
    const ap = pos(indexById[srcId])
    return matchEntries
      .filter(([id]) => indexById[id] != null)
      .map(([id, score]) => {
        const bp = pos(indexById[id])
        const mx = (ap.x + bp.x) / 2
        const my = (ap.y + bp.y) / 2
        const cpx = mx + (CX - mx) * 0.55
        const cpy = my + (CY - my) * 0.55
        return {
          key: `${srcId}-${id}`,
          d: `M ${ap.x.toFixed(0)} ${ap.y.toFixed(0)} Q ${cpx.toFixed(0)} ${cpy.toFixed(0)} ${bp.x.toFixed(0)} ${bp.y.toFixed(0)}`,
          color: getMatchScoreTone(score).solidColor,
          width: Number(
            (1.5 + (matchScoreToPercentage(score) / 100) * 3.4).toFixed(1)
          ),
          opacity: 0.76,
        }
      })
  })

  return (
    <div
      onMouseLeave={() => onHover(null)}
      className='relative mx-auto aspect-square w-full max-w-[min(712px,calc(100svh-300px))]'
    >
      <style>{`@keyframes wheel-draw { from { stroke-dashoffset: 900 } to { stroke-dashoffset: 0 } }`}</style>

      <svg
        viewBox={`0 0 ${BOX} ${BOX}`}
        className='absolute inset-0 h-full w-full overflow-visible'
        style={{ zIndex: 1, pointerEvents: 'none' }}
      >
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill='none'
          stroke='var(--border)'
          strokeWidth={1.5}
          strokeDasharray='2 8'
        />
        {arcs.map(arc => (
          <path
            key={arc.key}
            d={arc.d}
            fill='none'
            stroke={arc.color}
            strokeLinecap='round'
            strokeWidth={arc.width}
            strokeDasharray={900}
            style={{
              opacity: arc.opacity,
              animation: building ? 'none' : 'wheel-draw .35s ease both',
            }}
          />
        ))}
      </svg>

      <div className='pointer-events-none absolute top-1/2 left-1/2 z-1 w-[46%] -translate-x-1/2 -translate-y-1/2 text-center'>
        <div className='font-heading text-[22px] leading-tight font-extrabold tracking-[-0.03em] text-foreground'>
          {centerTitle}
        </div>
        <div className='mt-1.5 text-[13px] font-medium text-muted-foreground'>
          {centerSub}
        </div>
      </div>

      {ordered.map((item, i) => {
        const p = pos(i)
        const flipUp = p.y > CY
        const alignRight = p.x > CX
        const isExcluded = excludedIds.has(item.id)
        const isSel = selectedIds.includes(item.id)
        const isMatch = matchedIds.has(item.id)
        const isHover = item.id === activeId
        const isSrc = building ? isSel : isHover
        const lit =
          !isExcluded &&
          (building ? isSel || isMatch : !active || isHover || isMatch)
        const dimByFilter =
          filterMatchIds != null &&
          !filterMatchIds.has(item.id) &&
          !active &&
          !building
        const img = getItemImageSrc(item)
        const boxShadow = isSel
          ? '0 0 0 3px rgba(61,90,61,.9), 0 6px 18px rgba(20,16,8,.18)'
          : isHover
            ? '0 6px 18px rgba(20,16,8,.22)'
            : isMatch
              ? '0 6px 18px rgba(20,16,8,.14)'
              : '0 6px 18px rgba(20,16,8,.09)'
        return (
          <div
            key={item.id}
            className='absolute'
            onMouseEnter={() => {
              onHover(item.id)
              setOpenDetailId(prev => (prev && prev !== item.id ? null : prev))
            }}
            onMouseLeave={() => onHover(null)}
            style={{
              left: `${((p.x - sz / 2) / BOX) * 100}%`,
              top: `${((p.y - sz / 2) / BOX) * 100}%`,
              width: `${szPct}%`,
              aspectRatio: '1',
              zIndex: openDetailId === item.id ? 60 : isSrc ? 5 : isSel ? 4 : 2,
              opacity: dimByFilter ? 0.2 : lit ? 1 : 0.45,
              filter: dimByFilter
                ? 'grayscale(1)'
                : lit
                  ? 'none'
                  : 'grayscale(.25)',
              transition: 'opacity .3s ease, filter .3s ease',
            }}
          >
            <button
              type='button'
              onClick={() => {
                if (isExcluded && !isSel) return
                onSelect(item)
                setOpenDetailId(null)
              }}
              aria-label={item.name}
              className='relative block h-full w-full p-0'
              style={{
                borderRadius: 18,
                background: 'var(--card)',
                border: isSel
                  ? `1px solid ${BRAND_ACCENT}`
                  : '1px solid var(--border)',
                cursor: isExcluded ? 'default' : 'pointer',
                transform: isSel
                  ? 'scale(1.12)'
                  : isHover
                    ? 'scale(1.09)'
                    : isMatch
                      ? 'scale(1.04)'
                      : 'scale(1)',
                boxShadow,
                transition:
                  'transform .2s ease, box-shadow .2s ease, border-color .18s',
              }}
            >
              <span
                className='absolute inset-[6px] block overflow-hidden rounded-[12px]'
                style={{ background: item.color.hex }}
              >
                {img && (
                  <img
                    src={img}
                    alt=''
                    className='absolute inset-0 h-full w-full object-cover'
                  />
                )}
              </span>
              {isSel && (
                <span
                  className='absolute -top-[12px] -right-[12px] flex size-[22px] items-center justify-center rounded-full text-[12px] text-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]'
                  style={{
                    background: BRAND_ACCENT,
                    animation: 'wpop .3s ease both',
                  }}
                >
                  ✓
                </span>
              )}
              {isMatch && scoreById[item.id] != null && (
                <span
                  className='font-mono absolute -bottom-[12px] -left-[12px] flex h-[23px] min-w-[23px] items-center justify-center rounded-[8px] px-[5px] text-[12px] font-semibold text-white shadow-[0_3px_8px_rgba(0,0,0,0.22)]'
                  style={{
                    background: getMatchScoreTone(scoreById[item.id])
                      .solidColor,
                    animation: 'wpop .3s ease both',
                  }}
                >
                  {scoreById[item.id]}
                </span>
              )}
            </button>

            {!coarse && isHover && (
              <button
                type='button'
                onClick={() => onEdit(item)}
                aria-label={`Edit ${item.name}`}
                className='absolute -top-[12px] -left-[12px] z-10 flex size-[22px] items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground'
              >
                <PencilIcon className='size-3.5' />
              </button>
            )}

            {!coarse && isHover && !isSel && (
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation()
                  onToggleExclude(item)
                }}
                aria-label='Hide from wheel'
                title='Hide from wheel'
                className='absolute -top-[12px] -right-[12px] z-10 flex size-[22px] items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground'
              >
                <EyeOffIcon className='size-3.5' />
              </button>
            )}

            {coarse && (
              <TileMenu
                canHide={!isSel}
                breakdown={isMatch ? breakdownById[item.id] : null}
                onEdit={() => onEdit(item)}
                onHide={() => onToggleExclude(item)}
              />
            )}

            {!coarse &&
              isMatch &&
              breakdownById[item.id] &&
              (isHover || openDetailId === item.id) && (
                <div
                  className='absolute -right-[12px] -bottom-[12px] z-20'
                  onMouseEnter={() => setOpenDetailId(item.id)}
                  onMouseLeave={() => setOpenDetailId(null)}
                >
                  <button
                    type='button'
                    onFocus={() => setOpenDetailId(item.id)}
                    onBlur={() => setOpenDetailId(null)}
                    aria-label='Why this score'
                    className='flex size-[22px] items-center justify-center rounded-full border border-border bg-card text-[12px] font-bold text-muted-foreground shadow-sm'
                  >
                    ?
                  </button>
                  {openDetailId === item.id && (
                    <div
                      className={cn(
                        'absolute z-50',
                        flipUp ? 'bottom-full pb-2' : 'top-full pt-2',
                        alignRight ? 'right-0' : 'left-0'
                      )}
                    >
                      <ScoreDetail breakdown={breakdownById[item.id]} />
                    </div>
                  )}
                </div>
              )}
          </div>
        )
      })}
    </div>
  )
}
