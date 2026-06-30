export type MatchScoreTone = {
  label: string
  shortLabel: string
  percentage: number
  badgeClassName: string
  barClassName: string
  borderClassName: string
  dotClassName: string
  solidColor: string
}

export const MAX_MATCH_SCORE = 36

type MatchScoreStyle = Omit<MatchScoreTone, 'percentage'>

const MATCH_SCORE_TONES: MatchScoreStyle[] = [
  {
    label: 'Works',
    shortLabel: 'OK',
    badgeClassName: 'border-[#8d7420] bg-[#fff8d8] text-[#67540d]',
    barClassName: 'bg-[#c5a329]',
    borderClassName: 'border-[#c5a329]',
    dotClassName: 'bg-[#c5a329]',
    solidColor: '#a68117',
  },
  {
    label: 'Great match',
    shortLabel: 'Great',
    badgeClassName: 'border-[#2f7650] bg-[#effaf2] text-[#174b31]',
    barClassName: 'bg-[#3d9862]',
    borderClassName: 'border-[#3d9862]',
    dotClassName: 'bg-[#3d9862]',
    solidColor: '#2f7d4f',
  },
  {
    label: 'Perfect match',
    shortLabel: 'Perfect',
    badgeClassName: 'border-[#245179] bg-[#eaf4fc] text-[#133050]',
    barClassName: 'bg-[#428bd2]',
    borderClassName: 'border-[#428bd2]',
    dotClassName: 'bg-[#428bd2]',
    solidColor: '#245179',
  },
]

export const SCORE_TIER_COLORS = {
  works: MATCH_SCORE_TONES[0].solidColor,
  great: MATCH_SCORE_TONES[1].solidColor,
  perfect: MATCH_SCORE_TONES[2].solidColor,
}

export function matchScoreToPercentage(score: number): number {
  const boundedScore = Math.max(0, Math.min(MAX_MATCH_SCORE, score))
  return Math.round((boundedScore / MAX_MATCH_SCORE) * 100)
}

export function getMatchScoreTone(score: number): MatchScoreTone {
  const percentage = matchScoreToPercentage(score)
  const tone =
    percentage >= 90
      ? MATCH_SCORE_TONES[2]
      : percentage >= 75
        ? MATCH_SCORE_TONES[1]
        : MATCH_SCORE_TONES[0]

  return { ...tone, percentage }
}
