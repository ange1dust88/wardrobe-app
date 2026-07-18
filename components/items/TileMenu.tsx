'use client'

import { useState } from 'react'
import { EyeOffIcon, HelpCircleIcon, PencilIcon } from 'lucide-react'
import type { ScoreBreakdown } from '@/lib/items'
import { ScoreDetail } from './ScoreDetail'

const ITEM_CLS =
  'flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-secondary'

export function TileMenu({
  canHide,
  breakdown,
  onEdit,
  onHide,
}: {
  canHide: boolean
  breakdown?: ScoreBreakdown | null
  onEdit: () => void
  onHide: () => void
}) {
  const [open, setOpen] = useState(false)
  const [why, setWhy] = useState(false)

  return (
    <div className='absolute -top-[10px] -right-[10px] z-30'>
      <button
        type='button'
        aria-label='Actions'
        onClick={e => {
          e.stopPropagation()
          setOpen(o => !o)
          setWhy(false)
        }}
        className='flex size-[24px] items-center justify-center rounded-full border border-border bg-card text-[15px] leading-none font-bold text-muted-foreground shadow-sm'
      >
        ⋯
      </button>
      {open && (
        <>
          <button
            type='button'
            aria-hidden
            tabIndex={-1}
            onClick={e => {
              e.stopPropagation()
              setOpen(false)
            }}
            className='fixed inset-0 z-40 cursor-default'
          />
          <div
            onClick={e => e.stopPropagation()}
            className='pop-in absolute top-full right-0 z-50 mt-1 min-w-[156px] origin-top-right rounded-[12px] border border-border bg-card p-1 shadow-[0_12px_32px_rgba(20,28,36,0.18)]'
          >
            <button
              type='button'
              className={ITEM_CLS}
              onClick={() => {
                setOpen(false)
                onEdit()
              }}
            >
              <PencilIcon className='size-3.5' /> Edit
            </button>
            {canHide && (
              <button
                type='button'
                className={ITEM_CLS}
                onClick={() => {
                  setOpen(false)
                  onHide()
                }}
              >
                <EyeOffIcon className='size-3.5' /> Hide from wheel
              </button>
            )}
            {breakdown && (
              <button
                type='button'
                className={ITEM_CLS}
                onClick={() => setWhy(v => !v)}
              >
                <HelpCircleIcon className='size-3.5' /> Why this score
              </button>
            )}
            {why && breakdown && (
              <div className='p-1'>
                <ScoreDetail breakdown={breakdown} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
