import type { ScoreBreakdown } from '@/lib/items'

const AXES: { key: keyof ScoreBreakdown; label: string; cap: number }[] = [
  { key: 'color', label: 'Color', cap: 12 },
  { key: 'role', label: 'Role', cap: 6 },
  { key: 'season', label: 'Season', cap: 5 },
  { key: 'palette', label: 'Palette', cap: 5 },
  { key: 'style', label: 'Style', cap: 5 },
  { key: 'pattern', label: 'Pattern', cap: 3 },
]

export function ScoreDetail({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <div className='w-[184px] rounded-xl border border-border bg-popover p-3 text-left shadow-lg'>
      <div className='mb-2 text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase'>
        Why this score
      </div>
      <div className='flex flex-col gap-1.5'>
        {AXES.map(axis => {
          const value = Math.round(breakdown[axis.key])
          const positive = value >= 0
          const pct = Math.max(0, Math.min(1, value / axis.cap)) * 100
          return (
            <div key={axis.key} className='flex items-center gap-2'>
              <span className='w-[44px] flex-none text-[11px] font-medium'>
                {axis.label}
              </span>
              <span className='h-1.5 flex-1 overflow-hidden rounded-full bg-muted'>
                <span
                  className='block h-full rounded-full'
                  style={{
                    width: `${pct}%`,
                    background: positive ? '#2f7d4f' : '#b5483a',
                  }}
                />
              </span>
              <span
                className='w-6 flex-none text-right text-[11px] font-bold'
                style={{ color: positive ? 'var(--color-foreground)' : '#b5483a' }}
              >
                {positive ? `+${value}` : value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
