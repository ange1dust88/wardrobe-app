'use client'

import { useEffect, useRef, useState } from 'react'
import {
  FEATURE_KINDS,
  FEATURE_OPTS,
  NEUTRAL_SEASON,
  ONBOARDING_PALETTES,
  SEASON_META,
  WHO_OPTIONS,
  deriveColoring,
  deriveSeason,
  type Features,
  type PaletteId,
  type Undertone,
  type Who,
} from '@/lib/onboarding'
import type { ProfileInput } from '@/lib/profile'
import { capture } from '@/lib/analytics'

type Props = {
  onComplete: (result: ProfileInput) => void
  saving?: boolean
}

const ACTIVE_GREEN = '#2f7d4f'
const ACTIVE_BG = '#eef4ef'

const UNDERTONE_CARDS: {
  key: Undertone
  label: string
  desc: string
  cols: string[]
}[] = [
  {
    key: 'warm',
    label: 'Warm',
    desc: 'gold looks better on you',
    cols: ['#e6b422', '#d98a2b', '#b5551f'],
  },
  {
    key: 'cool',
    label: 'Cool',
    desc: 'silver looks better on you',
    cols: ['#c3c8d0', '#9aa6bd', '#5f7398'],
  },
]

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function Onboarding({ onComplete, saving }: Props) {
  const [step, setStep] = useState(0)
  const [who, setWho] = useState<Who | null>(null)
  const [features, setFeatures] = useState<Features>({
    hair: null,
    eyes: null,
    skin: null,
  })
  const [undertone, setUndertone] = useState<Undertone | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  function advance(to: number, delay: number) {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setStep(to), delay)
  }

  const anyFeature =
    features.hair != null || features.eyes != null || features.skin != null
  const coloring = deriveColoring(features)
  const seasonId = deriveSeason(coloring, undertone)
  const display = seasonId
    ? {
        name: SEASON_META[seasonId].label,
        sub: SEASON_META[seasonId].blurb,
        colors: ONBOARDING_PALETTES.find(p => p.id === seasonId)!.colors,
      }
    : {
        name: NEUTRAL_SEASON.label,
        sub: NEUTRAL_SEASON.blurb,
        colors: NEUTRAL_SEASON.colors,
      }

  function finish(palettes: PaletteId[]) {
    capture('onboarding_completed', { who, season: palettes[0] ?? null })
    onComplete({
      who,
      climate: null,
      palettes,
      hair: features.hair,
      eyes: features.eyes,
      skin: features.skin,
      undertone,
    })
  }

  const skipLink = (to: number) => (
    <button
      type='button'
      onClick={() => setStep(to)}
      className='mt-3.5 text-[14px] text-muted-foreground underline underline-offset-[3px] hover:text-foreground'
    >
      not sure — skip this
    </button>
  )

  return (
    <div className='relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground'>
      {step >= 1 && step <= 4 && (
        <div className='absolute top-0 right-0 left-0 z-[5] flex items-center justify-center px-[30px] py-[26px]'>
          <div className='font-heading text-[22px] font-bold tracking-[-0.04em]'>
            dress
          </div>
        </div>
      )}

      <div className='flex flex-1 flex-col items-center justify-center px-6 pt-[90px] pb-[70px] text-center'>
        {step === 0 && (
          <div className='rise-in flex flex-col items-center'>
            <div className='mb-[34px] flex size-[60px] items-center justify-center rounded-[16px] bg-foreground'>
              <span
                className='size-[13px] rounded-full'
                style={{ background: '#7fae7f' }}
              />
            </div>
            <div className='font-heading text-[40px] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance sm:text-[52px]'>
              A quieter way to get dressed.
            </div>
            <div className='mt-5 max-w-[430px] text-[17px] leading-relaxed text-muted-foreground'>
              Add your clothes, and dress scores every pairing so you always
              know what goes with what.
            </div>
            <button
              type='button'
              onClick={() => setStep(1)}
              className='mt-[34px] rounded-[14px] bg-foreground px-[30px] py-[15px] text-[16px] font-semibold text-background transition-transform hover:-translate-y-0.5'
            >
              Get started
            </button>
          </div>
        )}

        {step === 1 && (
          <div className='rise-in flex flex-col items-center'>
            <div className='font-heading mb-10 text-[34px] font-extrabold tracking-[-0.03em] sm:text-[40px]'>
              Who are we styling?
            </div>
            <div className='flex flex-wrap justify-center gap-4'>
              {WHO_OPTIONS.map(v => (
                <button
                  key={v}
                  type='button'
                  onClick={() => {
                    setWho(v)
                    advance(2, 140)
                  }}
                  className='font-heading rounded-[16px] border-[1.5px] px-10 py-[22px] text-[19px] font-bold tracking-[-0.01em] shadow-[0_4px_14px_rgba(30,40,50,0.05)] transition-[transform,border-color] hover:-translate-y-0.5 hover:border-foreground'
                  style={{
                    background: who === v ? ACTIVE_BG : 'var(--card)',
                    borderColor: who === v ? ACTIVE_GREEN : 'var(--border)',
                  }}
                >
                  {cap(v)}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className='rise-in flex flex-col items-center'>
            <div className='font-heading text-[34px] font-extrabold tracking-[-0.03em] sm:text-[40px]'>
              A few of your features
            </div>
            <div className='mt-3 text-[16px] text-muted-foreground'>
              tap what&rsquo;s closest — this tunes your palette
            </div>
            <div className='mt-10 flex flex-col gap-[22px] rounded-[20px] border border-border bg-card px-[26px] py-[24px] shadow-[0_6px_20px_rgba(30,40,50,0.06)] sm:px-[30px] sm:py-[26px]'>
              {FEATURE_KINDS.map(kind => (
                <div key={kind} className='flex items-center gap-4 sm:gap-5'>
                  <div className='font-mono w-[46px] flex-none text-left text-[11px] tracking-[0.12em] text-muted-foreground uppercase'>
                    {kind}
                  </div>
                  <div className='flex gap-2.5 sm:gap-3'>
                    {FEATURE_OPTS[kind].map((o, i) => {
                      const on = features[kind] === i
                      return (
                        <button
                          key={i}
                          type='button'
                          aria-label={`${kind} ${i + 1}`}
                          onClick={() =>
                            setFeatures(f => ({ ...f, [kind]: i }))
                          }
                          className='size-[38px] rounded-full transition-transform sm:size-[42px]'
                          style={{
                            background: o.c,
                            transform: on ? 'scale(1.08)' : 'scale(1)',
                            boxShadow: on
                              ? 'inset 0 0 0 1px rgba(0,0,0,.08), 0 0 0 2px var(--foreground), 0 0 0 4px var(--card)'
                              : 'inset 0 0 0 1px rgba(0,0,0,.08)',
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button
              type='button'
              disabled={!anyFeature}
              onClick={() => anyFeature && setStep(3)}
              className='mt-[30px] rounded-[13px] px-[34px] py-3.5 text-[15px] font-semibold transition-transform enabled:hover:-translate-y-0.5'
              style={
                anyFeature
                  ? {
                      background: 'var(--foreground)',
                      color: 'var(--background)',
                    }
                  : {
                      background: '#e2e6e8',
                      color: '#a3a9ad',
                      cursor: 'not-allowed',
                    }
              }
            >
              Continue
            </button>
            {skipLink(3)}
          </div>
        )}

        {step === 3 && (
          <div className='rise-in flex flex-col items-center'>
            <div className='font-heading text-[34px] font-extrabold tracking-[-0.03em] sm:text-[40px]'>
              Which suits you better?
            </div>
            <div className='mt-3 text-[16px] text-muted-foreground'>
              the classic gold-vs-silver test
            </div>
            <div className='mt-10 flex flex-wrap justify-center gap-[22px]'>
              {UNDERTONE_CARDS.map(c => {
                const on = undertone === c.key
                return (
                  <button
                    key={c.key}
                    type='button'
                    onClick={() => {
                      setUndertone(c.key)
                      advance(4, 160)
                    }}
                    className='flex w-[210px] flex-col items-center rounded-[20px] border-[1.5px] px-[22px] pt-6 pb-[26px] shadow-[0_6px_20px_rgba(30,40,50,0.06)] transition-[transform,border-color] hover:-translate-y-[3px] hover:border-foreground sm:w-[230px]'
                    style={{
                      background: on ? ACTIVE_BG : 'var(--card)',
                      borderColor: on ? ACTIVE_GREEN : 'var(--border)',
                    }}
                  >
                    <div className='flex gap-2'>
                      {c.cols.map(col => (
                        <span
                          key={col}
                          className='size-11 rounded-[12px]'
                          style={{
                            background: col,
                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)',
                          }}
                        />
                      ))}
                    </div>
                    <div className='font-heading mt-[18px] text-[22px] font-extrabold tracking-[-0.02em]'>
                      {c.label}
                    </div>
                    <div className='mt-[7px] text-[14px] text-muted-foreground'>
                      {c.desc}
                    </div>
                  </button>
                )
              })}
            </div>
            {skipLink(4)}
          </div>
        )}

        {step === 4 && (
          <div className='rise-in flex flex-col items-center'>
            <div className='font-mono text-[12px] tracking-[0.24em] text-muted-foreground uppercase'>
              Your colour season
            </div>
            <div className='font-heading mt-3 text-[56px] leading-none font-extrabold tracking-[-0.04em] sm:text-[66px]'>
              {display.name}
            </div>
            <div className='mt-2.5 text-[17px] text-muted-foreground'>
              {display.sub}
            </div>
            <div className='mt-[30px] flex gap-3.5'>
              {display.colors.map(c => (
                <span
                  key={c}
                  className='size-[52px] rounded-[15px] sm:size-[60px]'
                  style={{
                    background: c,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)',
                  }}
                />
              ))}
            </div>
            <div className='mt-[30px] max-w-[400px] text-[15.5px] leading-relaxed text-muted-foreground'>
              We&rsquo;ll tune every match to your palette. You can change it
              anytime in your profile.
            </div>
            <button
              type='button'
              disabled={saving}
              onClick={() => finish(seasonId ? [seasonId] : [])}
              className='mt-[30px] rounded-[14px] bg-foreground px-[34px] py-[15px] text-[16px] font-semibold text-background transition-transform hover:-translate-y-0.5 disabled:opacity-60'
            >
              {saving ? 'Setting up…' : 'Start dressing'}
            </button>
            <button
              type='button'
              onClick={() => {
                setStep(1)
                setFeatures({ hair: null, eyes: null, skin: null })
                setUndertone(null)
              }}
              className='mt-4 text-[14px] text-muted-foreground underline underline-offset-[3px] hover:text-foreground'
            >
              not me — redo
            </button>
          </div>
        )}
      </div>

      {step >= 1 && step <= 3 && (
        <div className='flex justify-center gap-[9px] pb-12'>
          {[0, 1, 2].map(i => {
            const active = i === step - 1
            const reachable = i + 1 <= step
            return (
              <button
                key={i}
                type='button'
                aria-label={`step ${i + 1}`}
                disabled={!reachable}
                onClick={() => reachable && setStep(i + 1)}
                className='h-[7px] rounded-full transition-all'
                style={{
                  width: active ? 26 : 7,
                  background: active ? 'var(--foreground)' : '#cdd3d6',
                  cursor: reachable ? 'pointer' : 'default',
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
