import { PencilIcon } from 'lucide-react'
import { useState } from 'react'
import { CATEGORIES, getItemImageSrc, type Item } from '../../lib/items'
import { getMatchScoreTone, matchScoreToPercentage } from '../../lib/match-score'
import { BRAND_ACCENT } from '../../lib/theme'
import type { ScoreBreakdown } from '../../lib/items'
import { ScoreBadge } from './ScoreBadge'
import { ScoreDetail } from './ScoreDetail'

type Props = {
  items: Item[]
  activeId: string | null
  selectedIds?: string[]
  matchedIds?: Set<string>
  scoreById?: Record<string, number>
  breakdownById?: Record<string, ScoreBreakdown>
  onHover: (id: string | null) => void
  onSelect: (item: Item) => void
  onEdit: (item: Item) => void
}

const BOX = 760
const CX = 380
const CY = 380
const R = 270

function isLightHex(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length < 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.86
}

export function MatchWheel({
  items,
  activeId,
  selectedIds = [],
  matchedIds = new Set(),
  scoreById = {},
  breakdownById = {},
  onHover,
  onSelect,
  onEdit,
}: Props) {
  const [openDetailId, setOpenDetailId] = useState<string | null>(null)
  const ordered = [...items].sort((a, b) => {
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

  const crowd = Math.min(1, (2 * Math.PI * R) / (n * 110))
  const sz = Math.round(84 * crowd)
  const szPct = (sz / BOX) * 100

  const active = activeId != null ? ordered.find(it => it.id === activeId) : null
  const matchEntries = Object.entries(scoreById)

  const building = selectedIds.length > 0

  let centerTitle = 'hover an item'
  let centerSub = 'matches arc across the wheel'
  if (building && matchEntries.length === 0) {
    centerTitle = 'All set'
    centerSub = 'create your outfit →'
  } else if (active) {
    if (matchEntries.length) {
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
        const cpx = mx + (CX - mx) * 0.72
        const cpy = my + (CY - my) * 0.72
        return {
          key: `${srcId}-${id}`,
          d: `M ${ap.x.toFixed(0)} ${ap.y.toFixed(0)} Q ${cpx.toFixed(0)} ${cpy.toFixed(0)} ${bp.x.toFixed(0)} ${bp.y.toFixed(0)}`,
          color: getMatchScoreTone(score).solidColor,
          width: Number((1.4 + matchScoreToPercentage(score) / 36).toFixed(1)),
          opacity: Number((0.42 + matchScoreToPercentage(score) / 180).toFixed(2)),
        }
      })
  })

  return (
    <div
      onMouseLeave={() => onHover(null)}
      className='relative mx-auto aspect-square w-full max-w-[712px]'
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
        <div className='font-heading text-[17px] leading-tight font-bold text-foreground'>
          {centerTitle}
        </div>
        <div className='mt-1 text-[13px] text-muted-foreground'>{centerSub}</div>
      </div>

      {ordered.map((item, i) => {
        const p = pos(i)
        const isSel = selectedIds.includes(item.id)
        const isMatch = matchedIds.has(item.id)
        const isHover = item.id === activeId
        const isSrc = building ? isSel : isHover
        const lit = building ? isSel || isMatch : !active || isHover || isMatch
        const img = getItemImageSrc(item)
        const boxShadow = isSel
          ? `0 0 0 2px var(--background), 0 0 0 4px ${BRAND_ACCENT}, 0 8px 22px rgba(0,0,0,.18)`
          : isSrc
            ? '0 0 0 2px var(--background), 0 0 0 4px #c08a2d, 0 10px 26px rgba(0,0,0,.2)'
            : isMatch
              ? '0 8px 22px rgba(0,0,0,.16)'
              : '0 2px 7px rgba(0,0,0,.1)'
        return (
          <div
            key={item.id}
            className='group absolute'
            style={{
              left: `${((p.x - sz / 2) / BOX) * 100}%`,
              top: `${((p.y - sz / 2) / BOX) * 100}%`,
              width: `${szPct}%`,
              aspectRatio: '1',
              zIndex: isSrc ? 5 : isSel ? 4 : 2,
              opacity: lit ? 1 : 0.45,
              filter: lit ? 'none' : 'grayscale(.25)',
              transition: 'opacity .3s ease, filter .3s ease',
            }}
          >
            <button
              type='button'
              onMouseEnter={() => onHover(item.id)}
              onClick={() => {
                onSelect(item)
                setOpenDetailId(null)
              }}
              aria-label={item.name}
              className='relative block h-full w-full overflow-hidden p-0'
              style={{
                borderRadius: 15,
                background: item.color.hex,
                border: isLightHex(item.color.hex)
                  ? '1px solid var(--border)'
                  : '1px solid transparent',
                cursor: 'pointer',
                transform: isSel
                  ? 'scale(1.15)'
                  : isMatch
                    ? 'scale(1.06)'
                    : 'scale(1)',
                boxShadow,
                transition: 'transform .25s ease, box-shadow .25s ease',
              }}
            >
              {img && (
                <img
                  src={img}
                  alt=''
                  className='absolute inset-0 h-full w-full object-cover'
                />
              )}
              {isSel && (
                <span
                  className='absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full text-[13px] text-white shadow'
                  style={{ background: BRAND_ACCENT }}
                >
                  ✓
                </span>
              )}
              {isMatch && scoreById[item.id] != null && (
                <ScoreBadge
                  score={scoreById[item.id]}
                  variant='chip'
                  className='absolute top-1.5 left-1.5 text-[11px] leading-tight'
                />
              )}
            </button>

            {isHover && (
              <button
                type='button'
                onClick={() => onEdit(item)}
                aria-label={`Edit ${item.name}`}
                className='absolute -top-1 -left-1 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm'
              >
                <PencilIcon className='size-3' />
              </button>
            )}

            {isMatch && breakdownById[item.id] && (
              <button
                type='button'
                onClick={() =>
                  setOpenDetailId(openDetailId === item.id ? null : item.id)
                }
                aria-label='Why this score'
                className={`absolute -right-1 -bottom-1 z-10 size-5 items-center justify-center rounded-full border border-border bg-background text-[11px] font-bold text-muted-foreground shadow-sm ${
                  openDetailId === item.id ? 'flex' : 'hidden group-hover:flex'
                }`}
              >
                ?
              </button>
            )}

            {openDetailId === item.id && breakdownById[item.id] && (
              <div className='absolute top-full left-1/2 z-50 -translate-x-1/2 pt-2'>
                <ScoreDetail breakdown={breakdownById[item.id]} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
