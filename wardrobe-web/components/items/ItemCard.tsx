import type { Item } from '../../lib/items'

export type CardState = 'anchor' | 'match' | 'dim' | 'normal'

type Props = {
  item: Item
  state: CardState
  score?: number
  onDelete: (id: string) => void
  onHover: (id: string | null) => void
}

const BOX_STATE: Record<CardState, string> = {
  anchor: 'border-2 border-black bg-black',
  match: 'border-2 border-black',
  dim: 'border border-black opacity-30',
  normal: 'border border-black',
}

export function ItemCard({ item, state, score, onDelete, onHover }: Props) {
  return (
    <div
      className='group relative flex flex-col gap-1'
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className={`relative aspect-square w-full ${BOX_STATE[state]}`}>
        {state === 'match' && score !== undefined && (
          <span className='absolute top-0 left-0 border border-black bg-white px-1 text-xs text-black'>
            {score}
          </span>
        )}
      </div>
      <span className='text-center text-sm text-black'>{item.name}</span>
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
