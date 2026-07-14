'use client'

import { PencilIcon, XIcon } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'
import { CATEGORY_LABELS, getItemImageSrc, type Item } from '@/lib/items'
import { getMatchScoreTone } from '@/lib/match-score'
import { cn } from '@/lib/utils'

const ROLE_LABEL: Record<string, string> = {
  core: 'Core',
  tonal: 'Tonal',
  pop: 'Accent',
}

function fmt(v?: string | null): string | null {
  if (!v) return null
  return v.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
}

export function ItemViewModal({
  item,
  matchScore,
  onClose,
  onEdit,
}: {
  item: Item
  matchScore?: number | null
  onClose: () => void
  onEdit: () => void
}) {
  const img = getItemImageSrc(item)
  const tone = matchScore != null ? getMatchScoreTone(matchScore) : null

  const specs: { k: string; v: string }[] = []
  const pattern = fmt(item.pattern)
  if (pattern) specs.push({ k: 'Pattern', v: pattern })
  const formality = fmt(item.formality)
  if (formality) specs.push({ k: 'Formality', v: formality })
  const fit = fmt(item.fit)
  if (fit) specs.push({ k: 'Fit', v: fit })
  specs.push({
    k: 'Role',
    v: ROLE_LABEL[item.wardrobeRole] ?? fmt(item.wardrobeRole) ?? '—',
  })
  const sub = fmt(item.subType)
  if (sub) specs.push({ k: 'Subtype', v: sub })
  specs.push({ k: 'Temperature', v: fmt(item.color.temperature) ?? '—' })

  return (
    <Dialog
      open
      onOpenChange={next => {
        if (!next) onClose()
      }}
    >
      <DialogPopup
        showCloseButton={false}
        className='w-[440px] max-w-[calc(100vw-2rem)] gap-0 overflow-hidden rounded-[24px] p-0'
      >
        <div className='relative flex items-center justify-center bg-secondary p-7'>
          {img ? (
            <img
              src={img}
              alt=''
              className='size-[150px] rounded-[16px] object-cover'
            />
          ) : (
            <span
              className='size-[150px] rounded-[16px]'
              style={{ background: item.color.hex }}
            />
          )}
          {tone && (
            <span
              className='font-mono absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-bold'
              style={{
                background: `color-mix(in srgb, ${tone.solidColor} 18%, var(--card))`,
                color: tone.solidColor,
              }}
            >
              {tone.percentage}% match
            </span>
          )}
          <DialogClose
            aria-label='Close'
            className='absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-card/90 text-muted-foreground transition-colors hover:bg-card'
          >
            <XIcon className='size-4' />
          </DialogClose>
        </div>

        <div className='p-6 pt-5'>
          <div className='font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase'>
            {CATEGORY_LABELS[item.category]}
          </div>
          <DialogTitle className='font-heading mt-1 text-[24px] font-extrabold tracking-[-0.02em]'>
            {item.name}
          </DialogTitle>

          <div className='mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[13px] border border-border bg-border'>
            {specs.map((s, i) => (
              <div
                key={s.k}
                className={cn(
                  'bg-card px-3.5 py-3',
                  i === specs.length - 1 &&
                    specs.length % 2 === 1 &&
                    'col-span-2'
                )}
              >
                <div className='font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase'>
                  {s.k}
                </div>
                <div className='mt-0.5 text-[14px] font-semibold'>{s.v}</div>
              </div>
            ))}
          </div>

          {item.seasonWear.length > 0 && (
            <div className='mt-4'>
              <div className='font-mono mb-2 text-[9px] tracking-[0.12em] text-muted-foreground uppercase'>
                Seasons
              </div>
              <div className='flex flex-wrap gap-1.5'>
                {item.seasonWear.map(s => (
                  <span
                    key={s}
                    className='rounded-full border border-border bg-secondary px-3 py-1.5 text-[12.5px] font-semibold text-foreground'
                  >
                    {fmt(s)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type='button'
            onClick={onEdit}
            className='mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-[11px] border border-border bg-card text-[14px] font-semibold text-foreground transition-colors hover:bg-secondary'
          >
            <PencilIcon className='size-4' /> Edit this piece
          </button>
        </div>
      </DialogPopup>
    </Dialog>
  )
}
