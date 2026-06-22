import { PencilIcon } from 'lucide-react'
import { CATEGORIES, getItemImageSrc, type Item } from '../../lib/items'

type Props = {
  items: Item[]
  hoveredId: string | null
  selectedIds?: string[]
  matchedIds?: Set<string>
  scoreById?: Record<string, number>
  outfitScore?: number | null
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

function tierLabel(score: number): string {
  return score >= 24 ? 'In harmony' : score >= 18 ? 'Almost there' : 'Clashing'
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
  outfitScore = null,
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

  const crowd = Math.min(1, (2 * Math.PI * R) / (n * 96))

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

  return (
    <div className='relative flex flex-col gap-2'>
      <style>{`
        @keyframes wheel-draw { from { stroke-dashoffset: 900 } to { stroke-dashoffset: 0 } }
      `}</style>

      {outfitScore != null && (
        <div
          className='absolute top-0 right-0 z-10 rounded-2xl px-4 py-3 text-white shadow-md'
          style={{ background: tier(outfitScore) }}
        >
          <div className='text-[11px] font-semibold tracking-[0.14em]'>
            HARMONY
          </div>
          <div className='font-heading mt-0.5 leading-none'>
            <span className='text-3xl font-bold'>{outfitScore}</span>
            <span className='text-sm text-white/70'> / 36</span>
          </div>
          <div className='mt-1 text-[12px]'>{tierLabel(outfitScore)}</div>
        </div>
      )}

      <div className='flex min-h-[26px] items-center justify-center'>
        <span className='text-[13px] text-muted-foreground'>{readout}</span>
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
              style={{
                opacity: arc.opacity,
                animation: building ? 'none' : 'wheel-draw 1s ease both',
              }}
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
          const showName = isMatch || (building && isSel)
          const sz = Math.round(72 * crowd)
          const score = scoreById[item.id]
          const labelRad = sz / 2 + 40
          const labelDx = Math.cos(p.ang) * labelRad
          const labelDy = Math.sin(p.ang) * labelRad
          const img = getItemImageSrc(item)
          return (
            <div
              key={item.id}
              onMouseLeave={() => onHover(null)}
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
                {isMatch && score != null && (
                  <span
                    className='font-heading absolute top-0.5 left-0.5 z-10 rounded-md px-1 text-[11px] leading-tight font-bold text-white shadow'
                    style={{ background: tier(score) }}
                  >
                    {score}
                  </span>
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

              {showName && (
                <div
                  className='pointer-events-none absolute line-clamp-2 w-[84px] text-center text-[10.5px] leading-tight font-medium text-[#4a443b]'
                  style={{
                    left: sz / 2,
                    top: sz / 2,
                    transform: `translate(-50%,-50%) translate(${labelDx.toFixed(0)}px, ${labelDy.toFixed(0)}px)`,
                  }}
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

      </div>
    </div>
  )
}
