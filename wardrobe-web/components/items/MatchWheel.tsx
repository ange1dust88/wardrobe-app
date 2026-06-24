import { PencilIcon } from 'lucide-react'
import { CATEGORIES, getItemImageSrc, type Item } from '../../lib/items'
import { getMatchScoreTone, matchScoreToPercentage } from '../../lib/match-score'

type Props = {
  items: Item[]
  activeId: string | null
  selectedIds?: string[]
  matchedIds?: Set<string>
  scoreById?: Record<string, number>
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
  onHover,
  onSelect,
  onEdit,
}: Props) {
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

  let centerTitle = 'hover or browse ‹ ›'
  let centerSub = 'matches arc across the wheel'
  if (active) {
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

  const arcs = active
    ? matchEntries
        .filter(([id]) => indexById[id] != null)
        .map(([id, score]) => {
          const ap = pos(indexById[active.id])
          const bp = pos(indexById[id])
          const mx = (ap.x + bp.x) / 2
          const my = (ap.y + bp.y) / 2
          const cpx = mx + (CX - mx) * 0.72
          const cpy = my + (CY - my) * 0.72
          return {
            key: id,
            d: `M ${ap.x.toFixed(0)} ${ap.y.toFixed(0)} Q ${cpx.toFixed(0)} ${cpy.toFixed(0)} ${bp.x.toFixed(0)} ${bp.y.toFixed(0)}`,
            color: getMatchScoreTone(score).solidColor,
            width: Number((1.4 + matchScoreToPercentage(score) / 36).toFixed(1)),
            opacity: Number((0.42 + matchScoreToPercentage(score) / 180).toFixed(2)),
          }
        })
    : []

  const chips = active
    ? matchEntries
        .filter(([id]) => indexById[id] != null)
        .map(([id, score]) => {
          const bp = pos(indexById[id])
          const chx = CX + (R + 30) * Math.cos(bp.ang)
          const chy = CY + (R + 30) * Math.sin(bp.ang)
          return {
            id,
            score,
            color: getMatchScoreTone(score).solidColor,
            leftPct: (chx / BOX) * 100,
            topPct: (chy / BOX) * 100,
          }
        })
    : []

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
            style={{ opacity: arc.opacity, animation: 'wheel-draw .35s ease both' }}
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
        const isSrc = item.id === activeId
        const lit = !active || isSrc || isMatch
        const img = getItemImageSrc(item)
        const boxShadow = isSel
          ? '0 0 0 2px var(--background), 0 0 0 4px #3d5a3d, 0 8px 22px rgba(0,0,0,.18)'
          : isSrc
            ? '0 0 0 2px var(--background), 0 0 0 4px #c08a2d, 0 10px 26px rgba(0,0,0,.2)'
            : isMatch
              ? '0 8px 22px rgba(0,0,0,.16)'
              : '0 2px 7px rgba(0,0,0,.1)'
        return (
          <div
            key={item.id}
            className='absolute'
            style={{
              left: `${((p.x - sz / 2) / BOX) * 100}%`,
              top: `${((p.y - sz / 2) / BOX) * 100}%`,
              width: `${szPct}%`,
              aspectRatio: '1',
              zIndex: isSrc ? 5 : isSel ? 4 : 2,
              opacity: lit ? 1 : 0.16,
              filter: lit ? 'none' : 'grayscale(.4)',
              transition: 'opacity .3s ease, filter .3s ease',
            }}
          >
            <button
              type='button'
              onMouseEnter={() => onHover(item.id)}
              onClick={() => onSelect(item)}
              aria-label={item.name}
              className='relative block h-full w-full overflow-hidden p-0'
              style={{
                borderRadius: 15,
                background: item.color.hex,
                border: isLightHex(item.color.hex)
                  ? '1px solid var(--border)'
                  : '1px solid transparent',
                cursor: 'pointer',
                transform: isMatch ? 'scale(1.06)' : 'scale(1)',
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
                <span className='absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-[#3d5a3d] text-[13px] text-white shadow'>
                  ✓
                </span>
              )}
            </button>

            {isSrc && (
              <button
                type='button'
                onClick={() => onEdit(item)}
                aria-label={`Edit ${item.name}`}
                className='absolute -top-1 -left-1 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm'
              >
                <PencilIcon className='size-3' />
              </button>
            )}
          </div>
        )
      })}

      <div className='pointer-events-none absolute inset-0 z-[6]'>
        {chips.map(chip => (
          <div
            key={chip.id}
            className='font-heading absolute rounded-lg px-2 py-0.5 text-[13px] font-bold text-white shadow-md'
            style={{
              left: `${chip.leftPct}%`,
              top: `${chip.topPct}%`,
              transform: 'translate(-50%,-50%)',
              background: chip.color,
            }}
          >
            {chip.score}
          </div>
        ))}
      </div>
    </div>
  )
}
