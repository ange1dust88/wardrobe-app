'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CLIMATE_OPTIONS,
  MAX_PALETTES,
  ONBOARDING_PALETTES,
  WHO_OPTIONS,
  type Climate,
  type PaletteId,
  type Who,
} from '@/lib/onboarding'
import type { ProfileInput } from '@/lib/profile'
import { BRAND_ACCENT } from '@/lib/theme'

const ACCENT = BRAND_ACCENT
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const PILL =
  'inline-flex cursor-pointer items-center justify-center rounded-full bg-[#1b1e20] px-[30px] py-[15px] text-[20px] font-bold text-white'

type Props = {
  onComplete: (result: ProfileInput) => void
  saving?: boolean
}

function Chip({
  label,
  on,
  onClick,
}: {
  label: string
  on: boolean
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='inline-flex cursor-pointer items-center gap-[11px] rounded-full bg-[#1b1e20] py-[13px] pr-[24px] pl-[15px]'
    >
      <span
        className='h-[18px] w-[18px] flex-none rounded-full transition-colors'
        style={{ background: on ? ACCENT : '#fff' }}
      />
      <span className='text-[20px] font-bold text-white'>{label}</span>
    </button>
  )
}

export function Onboarding({ onComplete, saving }: Props) {
  const [step, setStep] = useState(0)
  const [who, setWho] = useState<Who | null>(null)
  const [climate, setClimate] = useState<Climate | null>(null)
  const [palettes, setPalettes] = useState<PaletteId[]>([])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  function advanceLater(to: number) {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setStep(to), 320)
  }

  function pickWho(value: Who) {
    setWho(value)
    advanceLater(2)
  }

  function pickClimate(value: Climate) {
    setClimate(value)
    advanceLater(3)
  }

  function togglePalette(value: PaletteId) {
    setPalettes(prev => {
      if (prev.includes(value)) return prev.filter(p => p !== value)
      const next = [...prev, value]
      if (next.length > MAX_PALETTES) next.shift()
      return next
    })
  }

  function back() {
    if (timer.current) clearTimeout(timer.current)
    setStep(s => Math.max(1, s - 1))
  }

  function complete() {
    onComplete({ who, climate, palettes })
  }

  return (
    <div
      className='flex min-h-screen flex-col items-center bg-[#eef0f1] px-6 pt-[44px] pb-10 text-[#1b1e20]'
      style={{ fontFamily: FONT }}
    >
      {step === 0 && (
        <div className='flex min-h-[62vh] flex-1 flex-col items-center justify-center text-center'>
          <div className='text-[36px] font-bold tracking-[0.1em]'>DRESS</div>
          <div className='mt-4 text-[23px] font-normal text-[#8a8a8a]'>
            a quiet way to dress
          </div>
          <button
            type='button'
            onClick={() => setStep(1)}
            className={`${PILL} mt-[42px]`}
          >
            make up an outfit
          </button>
        </div>
      )}

      {step >= 1 && step <= 3 && (
        <div className='flex w-full max-w-[760px] flex-1 flex-col'>
          <div className='text-center text-[23px] font-bold tracking-[0.1em]'>
            DRESS
          </div>

          <div className='flex min-h-[52vh] flex-1 flex-col items-center justify-center py-[30px]'>
            {step === 1 && (
              <div className='flex flex-col items-center'>
                <div className='mb-9 text-center text-[29px] font-normal text-[#5a5a5a]'>
                  who do we select clothes for?
                </div>
                <div className='flex flex-wrap justify-center gap-4'>
                  {WHO_OPTIONS.map(value => (
                    <Chip
                      key={value}
                      label={value}
                      on={who === value}
                      onClick={() => pickWho(value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className='flex flex-col items-center'>
                <div className='mb-9 text-center text-[29px] font-normal text-[#5a5a5a]'>
                  what climate do you live in?
                </div>
                <div className='flex flex-wrap justify-center gap-4'>
                  {CLIMATE_OPTIONS.map(value => (
                    <Chip
                      key={value}
                      label={value}
                      on={climate === value}
                      onClick={() => pickClimate(value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className='flex flex-col items-center'>
                <div className='text-center text-[29px] font-normal text-[#5a5a5a]'>
                  what colors feel like you?
                </div>
                <div className='mt-[10px] mb-[34px] text-center text-[18px] font-normal text-[#a2a2a2]'>
                  pick 1–2 palettes. we&apos;ll use them to fine-tune outfit
                  suggestions
                </div>
                <div className='grid grid-cols-2 justify-center gap-x-[56px] gap-y-[28px]'>
                  {ONBOARDING_PALETTES.map(palette => {
                    const selected = palettes.includes(palette.id)
                    const faded = palettes.length > 0 && !selected
                    return (
                      <button
                        key={palette.id}
                        type='button'
                        onClick={() => togglePalette(palette.id)}
                        className='flex cursor-pointer flex-col items-center gap-[11px] bg-transparent'
                      >
                        <div
                          className='rounded-[14px] p-2 transition-[border-color,filter] duration-200'
                          style={{
                            border: `3px solid ${selected ? ACCENT : 'transparent'}`,
                            filter: faded ? 'saturate(.3) opacity(.5)' : 'none',
                          }}
                        >
                          <div className='grid grid-cols-2 gap-[7px]'>
                            {palette.colors.map(color => (
                              <div
                                key={color}
                                className='h-[60px] w-[60px] rounded-[10px]'
                                style={{ background: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <div
                          className='text-[17px] transition-colors'
                          style={{
                            color: faded ? '#c4c4c4' : '#1b1e20',
                            fontWeight: selected ? 500 : 400,
                          }}
                        >
                          {palette.label}
                        </div>
                      </button>
                    )
                  })}
                </div>
                {palettes.length >= 1 && (
                  <div className='mt-[38px]'>
                    <button
                      type='button'
                      onClick={() => setStep(4)}
                      className={PILL}
                    >
                      finish
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='flex min-h-[24px] items-center justify-center gap-[9px] text-[17px] text-[#8a8a8a]'>
            {(step === 2 || step === 3) && (
              <button
                type='button'
                onClick={back}
                className='cursor-pointer px-1 py-0.5 text-[14px] text-[#8a8a8a]'
              >
                ◄
              </button>
            )}
            <span>step {step} / 3</span>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className='flex min-h-[62vh] flex-1 flex-col items-center justify-center text-center'>
          <div
            className='flex h-[66px] w-[66px] items-center justify-center rounded-full text-[30px] font-bold text-white'
            style={{ background: ACCENT }}
          >
            ✓
          </div>
          <div className='mt-[26px] text-[31px] font-bold'>
            you&apos;re all set
          </div>
          <div className='mt-[10px] text-[20px] font-normal text-[#8a8a8a]'>
            dress is tuned to your picks
          </div>
          <button
            type='button'
            onClick={complete}
            disabled={saving}
            className={`${PILL} mt-[34px] disabled:opacity-60`}
          >
            {saving ? 'setting up…' : 'enter wardrobe'}
          </button>
        </div>
      )}
    </div>
  )
}
