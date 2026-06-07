import { getItemImageSrc, type Item } from '../../lib/items'
import { getMatchScoreTone } from '@/lib/match-score'
import { cn } from '@/lib/utils'

export type CardState = 'anchor' | 'match' | 'dim' | 'normal'

type Props = {
  item: Item
  state: CardState
  score?: number
  onDelete: (id: string) => void
  onHover: (id: string | null) => void
}

const BOX_STATE: Record<CardState, string> = {
  anchor: 'border-2 border-black shadow-[inset_0_0_0_2px_#fbfaf6]',
  match: 'border-2',
  dim: 'border border-black opacity-30',
  normal: 'border border-black',
}

export function ItemCard({ item, state, score, onDelete, onHover }: Props) {
  const tone = score !== undefined ? getMatchScoreTone(score) : null
  const imageSrc = getItemImageSrc(item)

  function activateCard() {
    onHover(item.id)
  }

  return (
    <div className='group relative flex flex-col gap-1'>
      <div
        className='flex cursor-pointer flex-col gap-1'
        role='button'
        tabIndex={0}
        onClick={activateCard}
        onFocus={activateCard}
        onBlur={() => onHover(null)}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            activateCard()
          }
        }}
        onMouseEnter={activateCard}
        onMouseLeave={() => onHover(null)}
      >
        <div
          className={cn(
            'relative aspect-square w-full overflow-hidden transition-[border-color,box-shadow,opacity] duration-150',
            BOX_STATE[state],
            state === 'match' && tone?.borderClassName
          )}
        >
          <div
            className='absolute inset-0'
            style={{ backgroundColor: item.color.hex }}
          />
          <div className='absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),transparent_45%,rgba(0,0,0,0.18))]' />
          {imageSrc && (
            <img
              src={imageSrc}
              alt=''
              className='absolute inset-0 h-full w-full object-cover'
            />
          )}
          {state === 'anchor' && (
            <div className='absolute inset-0 bg-black/10 ring-2 ring-inset ring-white/70' />
          )}
          {state === 'match' && score !== undefined && tone && (
            <>
              <span
                className={cn(
                  'absolute top-1 left-1 inline-flex h-6 min-w-9 items-center justify-center gap-1 rounded-sm border px-1.5 text-[11px] leading-none font-semibold shadow-sm',
                  tone.badgeClassName
                )}
                title={`${tone.label}: ${score}/36`}
              >
                <span
                  className={cn('size-1.5 rounded-full', tone.dotClassName)}
                />
                {score}
              </span>
              <span
                className={cn(
                  'absolute inset-x-0 bottom-0 h-1.5',
                  tone.barClassName
                )}
              />
            </>
          )}
        </div>
        <span className='text-center text-sm text-black'>{item.name}</span>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        aria-label='Delete'
        className='absolute top-1 right-1 hidden border border-black bg-white px-1 text-xs text-black group-hover:block'
      >
        ✕
      </button>
    </div>
  )
}
