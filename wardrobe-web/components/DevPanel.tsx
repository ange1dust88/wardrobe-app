'use client'

import { PaletteIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const COLOR_TYPES = ['spring', 'summer', 'autumn', 'winter'] as const

type Props = {
  colorType: string | null
  onColorType: (value: string | null) => void
  showSeasons: boolean
  onShowSeasons: (value: boolean) => void
}

function chip(active: boolean): string {
  return `border border-black px-2 py-0.5 text-xs ${
    active ? 'bg-black text-white' : 'bg-white text-black'
  }`
}

export function DevPanel({
  colorType,
  onColorType,
  showSeasons,
  onShowSeasons,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label='Dev panel'
        className='fixed right-4 bottom-4 z-40 flex size-12 items-center justify-center rounded-full border border-black bg-white text-black shadow-lg transition-colors hover:bg-black hover:text-white'
      >
        <PaletteIcon className='size-5' />
      </PopoverTrigger>

      <PopoverContent side='top' align='end' className='w-56'>
        <div className='flex flex-col gap-3 text-black'>
          <div className='text-xs font-semibold tracking-wide uppercase'>
            Dev panel
          </div>

          <div className='flex flex-col gap-1'>
            <span className='text-xs text-muted-foreground'>Color type</span>
            <div className='flex flex-wrap gap-1'>
              <button
                type='button'
                onClick={() => onColorType(null)}
                className={chip(!colorType)}
              >
                none
              </button>
              {COLOR_TYPES.map(ct => (
                <button
                  key={ct}
                  type='button'
                  onClick={() => onColorType(ct)}
                  className={chip(colorType === ct)}
                >
                  {ct}
                </button>
              ))}
            </div>
          </div>

          <label className='flex items-center gap-2 text-xs'>
            <input
              type='checkbox'
              checked={showSeasons}
              onChange={e => onShowSeasons(e.target.checked)}
            />
            Show seasons
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}
