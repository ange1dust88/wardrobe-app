import { SCORE_TIER_COLORS } from '@/lib/match-score'

const AXES: { k: string; max: number; fill: number; desc: string }[] = [
  {
    k: 'Color',
    max: 11,
    fill: 9,
    desc: 'How the two main colors relate — neutrals pair widely, accents need a partner.',
  },
  {
    k: 'Role',
    max: 5,
    fill: 5,
    desc: 'Different slots complete a look; two of the same slot compete.',
  },
  {
    k: 'Season',
    max: 5,
    fill: 4,
    desc: 'Shared seasons keep an outfit weather-true.',
  },
  {
    k: 'Palette',
    max: 5,
    fill: 5,
    desc: 'Pieces from the same seasonal palette sit in harmony.',
  },
  {
    k: 'Style',
    max: 5,
    fill: 5,
    desc: 'Matching formality — casual with casual, smart with smart.',
  },
  {
    k: 'Pattern',
    max: 3,
    fill: 2,
    desc: 'Solids are safe; two busy patterns fight for attention.',
  },
  {
    k: 'Fit',
    max: 2,
    fill: 2,
    desc: 'Proportion play — a relaxed top over a slim bottom.',
  },
]

const TIERS: { label: string; min: string; color: string }[] = [
  { label: 'Works', min: '21+', color: SCORE_TIER_COLORS.works },
  { label: 'Great', min: '28+', color: SCORE_TIER_COLORS.great },
  { label: 'Perfect', min: '34+', color: SCORE_TIER_COLORS.perfect },
]

function barColor(max: number): string {
  if (max >= 8) return SCORE_TIER_COLORS.perfect
  if (max >= 4) return SCORE_TIER_COLORS.great
  return SCORE_TIER_COLORS.works
}

export default function HowItWorks() {
  return (
    <div className='px-6 pt-4 pb-24 sm:px-10'>
      <div className='mx-auto max-w-[820px]'>
        <h1 className='font-heading text-[clamp(30px,5vw,40px)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance'>
          Every pairing, on a scale of 36.
        </h1>
        <p className='mt-3.5 max-w-[600px] text-[16px] leading-relaxed text-muted-foreground'>
          When you hover a piece, dress scores it against every other piece
          across seven axes, then arcs a line to each — its color and weight set
          by the total. Here&apos;s what goes into it.
        </p>

        <div className='mt-6 flex flex-wrap gap-x-5 gap-y-2'>
          {TIERS.map(t => (
            <div key={t.label} className='flex items-center gap-2 text-[13px]'>
              <span
                className='size-3 flex-none rounded-[3px]'
                style={{ background: t.color }}
              />
              <span className='font-semibold text-foreground'>{t.label}</span>
              <span className='text-muted-foreground'>{t.min}</span>
            </div>
          ))}
        </div>

        <div className='mt-8 flex flex-col'>
          {AXES.map(a => (
            <div
              key={a.k}
              className='flex items-center gap-4 border-t border-border py-[18px] sm:gap-6'
            >
              <div className='w-[92px] flex-none sm:w-[132px]'>
                <div className='font-heading text-[18px] font-bold tracking-[-0.01em]'>
                  {a.k}
                </div>
                <div className='font-mono mt-0.5 text-[10.5px] text-muted-foreground'>
                  max {a.max}
                </div>
              </div>
              <div className='flex-1 text-[14px] leading-relaxed text-muted-foreground'>
                {a.desc}
              </div>
              <div className='hidden w-[120px] flex-none gap-[3px] sm:flex'>
                {Array.from({ length: a.max }).map((_, i) => (
                  <span
                    key={i}
                    className='h-2 flex-1 rounded-[2px]'
                    style={{
                      background: i < a.fill ? barColor(a.max) : 'var(--muted)',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
