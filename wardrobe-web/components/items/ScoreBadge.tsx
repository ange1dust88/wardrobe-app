import { getMatchScoreTone } from '@/lib/match-score'
import { cn } from '@/lib/utils'

type Props = {
  score: number
  variant?: 'full' | 'chip'
  className?: string
}

export function ScoreBadge({ score, variant = 'full', className }: Props) {
  const tone = getMatchScoreTone(score)
  return (
    <span
      className={cn(
        'font-heading font-bold text-white',
        variant === 'full'
          ? 'rounded-[9px] px-2.5 py-0.5 text-[13px]'
          : 'rounded-md px-1.5 text-[12px] shadow',
        className
      )}
      style={{ background: tone.solidColor }}
    >
      {variant === 'full' ? `${score} / 36` : score}
    </span>
  )
}
