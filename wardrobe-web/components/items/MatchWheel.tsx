import { PencilIcon } from 'lucide-react'
import { CATEGORIES, getItemImageSrc, type Item } from '../../lib/items'

type Props = {
  items: Item[]
  hoveredId: string | null
  selectedIds?: string[]
  matchedIds?: Set<string>
  scoreById?: Record<string, number>
  showSeasons?: boolean
  onHover: (id: string | null) => void
  onSelect: (item: Item) => void
  onEdit: (item: Item) => void
}

const W = 760
const H = 680
const CX = 380
const CY = 338
const R = 248

function tier(score: number): string {
  return score >= 24 ? '#2f7d4f' : score >= 18 ? '#c08a2d' : '#b5483a'
}

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
  hoveredId,
  selectedIds = [],
  matchedIds = new Set(),
  scoreById = {},
  showSeasons,
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

  const building = selectedIds.length > 0
  const anchor = !building && hoveredId ? indexById[hoveredId] != null : false
  const anchorItem = anchor
    ? ordered.find(it => it.id === hoveredId)!
    : null

  const matchEntries = Object.entries(scoreById)

  let centerTitle = 'ward'
  let centerSub = 'hover to explore'
  let readout = 'Hover any piece — harmonious matches arc across the wheel.'

  if (building) {
    centerTitle = `${selectedIds.length} selected`
    centerSub = 'building outfit'
    readout = `${selectedIds.length} selected · ${matchEntries.length} match${matchEntries.length === 1 ? '' : 'es'}`
  } else if (anchorItem) {
    if (matchEntries.length) {
      const [topId, topScore] = matchEntries.reduce((a, b) =>
        b[1] > a[1] ? b : a
      )
      const top = ordered.find(it => it.id === topId)
      centerTitle = anchorItem.name
      centerSub = `best · ${top?.name} (${topScore})`
      readout = `${anchorItem.name} harmonises with ${matchEntries.length} piece${matchEntries.length === 1 ? '' : 's'} · strongest: ${top?.name} (${topScore})`
    } else {
      centerTitle = anchorItem.name
      centerSub = 'no pairings'
      readout = `${anchorItem.name} — no matches in other categories.`
    }
  }

  const sourceIds = building
    ? selectedIds.filter(id => indexById[id] != null)
    : anchorItem
      ? [anchorItem.id]
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
          color: tier(score),
          width: Number((1.4 + score / 9).toFixed(1)),
          opacity: Number((0.5 + score / 72).toFixed(2)),
        }
      })
  })

  const chips = matchEntries
    .filter(([id]) => indexById[id] != null)
    .map(([id, score]) => {
      const bp = pos(indexById[id])
      const chx = CX + (R + 28) * Math.cos(bp.ang)
      const chy = CY + (R + 28) * Math.sin(bp.ang)
      return {
        id,
        score,
        color: tier(score),
        leftPct: (chx / W) * 100,
        topPct: (chy / H) * 100,
      }
    })

  return (
    <div className='flex flex-col gap-2'>
      <style>{`
        @keyframes wheel-draw { from { stroke-dashoffset: 900 } to { stroke-dashoffset: 0 } }
        @keyframes wheel-chip { 0% { opacity:0; transform:translate(-50%,-50%) scale(.5) } 60% { opacity:1; transform:translate(-50%,-50%) scale(1.12) } 100% { opacity:1; transform:translate(-50%,-50%) scale(1) } }
      `}</style>

      <div className='h-5 text-center text-[13px] text-muted-foreground'>
        {readout}
      </div>

      <div
        onMouseLeave={() => onHover(null)}
        className='relative mx-auto w-full max-w-[760px]'
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className='absolute inset-0 h-full w-full overflow-visible'
          style={{ zIndex: 1, pointerEvents: 'none' }}
        >
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill='none'
            stroke='#ddd6c8'
            strokeWidth={1.5}
            strokeDasharray='2 7'
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
              style={{ opacity: arc.opacity, animation: 'wheel-draw 1s ease both' }}
            />
          ))}
        </svg>

        <div
          className='absolute z-[1] w-[150px] -translate-x-1/2 -translate-y-1/2 text-center'
          style={{ left: '50%', top: `${(CY / H) * 100}%`, pointerEvents: 'none' }}
        >
          <div className='font-heading text-lg leading-tight font-bold text-black'>
            {centerTitle}
          </div>
          <div className='mt-1 text-[12.5px] text-muted-foreground'>
            {centerSub}
          </div>
        </div>

        {ordered.map((item, i) => {
          const p = pos(i)
          const isSel = selectedIds.includes(item.id)
          const isMatch = matchedIds.has(item.id)
          const isSrc = building ? isSel : item.id === hoveredId
          const lit = building
            ? isSel || isMatch
            : !hoveredId || item.id === hoveredId || isMatch
          const sz = item.wardrobeRole === 'pop' ? 78 : 68
          const img = getItemImageSrc(item)
          return (
            <div
              key={item.id}
              className='absolute'
              style={{
                left: `calc(${((p.x / W) * 100).toFixed(3)}% - ${sz / 2}px)`,
                top: `calc(${((p.y / H) * 100).toFixed(3)}% - ${sz / 2}px)`,
                zIndex: isSrc ? 4 : 2,
                opacity: lit ? 1 : 0.12,
                filter: lit ? 'none' : 'grayscale(.5) blur(.5px)',
                transition: 'opacity .3s ease, filter .3s ease',
              }}
            >
              <button
                type='button'
                onMouseEnter={() => onHover(item.id)}
                onClick={() => onSelect(item)}
                aria-label={item.name}
                className='relative block overflow-hidden p-0'
                style={{
                  width: sz,
                  height: sz,
                  borderRadius: 13,
                  background: item.color.hex,
                  border: isLightHex(item.color.hex)
                    ? '1px solid #e0dacf'
                    : '1px solid transparent',
                  cursor: 'pointer',
                  transform: isMatch ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isSrc
                    ? '0 0 0 2px #f3f1ea, 0 0 0 4px #3d5a3d, 0 10px 26px rgba(26,24,21,.2)'
                    : isMatch
                      ? '0 8px 22px rgba(26,24,21,.16)'
                      : '0 2px 7px rgba(26,24,21,.1)',
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
              </button>

              {isSrc && !building && (
                <button
                  type='button'
                  onClick={() => onEdit(item)}
                  aria-label='Edit'
                  className='absolute -top-1 -right-1 z-10 rounded-full border border-black bg-white p-1 text-black'
                >
                  <PencilIcon className='size-3' />
                </button>
              )}

              {lit && (
                <div
                  className='pointer-events-none absolute left-1/2 w-[104px] -translate-x-1/2 text-center text-[10.5px] leading-tight font-medium text-[#4a443b]'
                  style={{ top: sz + 6 }}
                >
                  {item.name}
                  {showSeasons && (
                    <span className='block text-[9px] text-muted-foreground'>
                      {item.seasonPaletteCompatibility.join(', ')}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}

        <div
          className='absolute inset-0 z-[5]'
          style={{ pointerEvents: 'none' }}
        >
          {chips.map(chip => (
            <div
              key={chip.id}
              className='font-heading absolute rounded-lg px-2 py-0.5 text-[13px] font-bold text-white shadow-md'
              style={{
                left: `${chip.leftPct}%`,
                top: `${chip.topPct}%`,
                transform: 'translate(-50%,-50%)',
                background: chip.color,
                animation: 'wheel-chip .5s ease both',
              }}
            >
              {chip.score}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
