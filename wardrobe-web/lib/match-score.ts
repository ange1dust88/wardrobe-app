export type MatchScoreTone = {
  label: string
  shortLabel: string
  badgeClassName: string
  barClassName: string
  borderClassName: string
  dotClassName: string
}

const MATCH_SCORE_TONES: MatchScoreTone[] = [
  {
    label: 'Разваленный образ',
    shortLabel: 'Развал',
    badgeClassName: 'border-[#8f2b2b] bg-[#fff0ed] text-[#6e1717]',
    barClassName: 'bg-[#d64232]',
    borderClassName: 'border-[#d64232]',
    dotClassName: 'bg-[#d64232]',
  },
  {
    label: 'Сырой образ',
    shortLabel: 'Сырой',
    badgeClassName: 'border-[#a75a18] bg-[#fff4e8] text-[#743807]',
    barClassName: 'bg-[#d9791f]',
    borderClassName: 'border-[#d9791f]',
    dotClassName: 'bg-[#d9791f]',
  },
  {
    label: 'Базовый образ',
    shortLabel: 'Базовый',
    badgeClassName: 'border-[#8d7420] bg-[#fff8d8] text-[#67540d]',
    barClassName: 'bg-[#c5a329]',
    borderClassName: 'border-[#c5a329]',
    dotClassName: 'bg-[#c5a329]',
  },
  {
    label: 'Собранный образ',
    shortLabel: 'Собранный',
    badgeClassName: 'border-[#2f7650] bg-[#effaf2] text-[#174b31]',
    barClassName: 'bg-[#3d9862]',
    borderClassName: 'border-[#3d9862]',
    dotClassName: 'bg-[#3d9862]',
  },
  {
    label: 'Сильный образ',
    shortLabel: 'Сильный',
    badgeClassName: 'border-[#236f84] bg-[#edf9fb] text-[#124b5c]',
    barClassName: 'bg-[#2b90a8]',
    borderClassName: 'border-[#2b90a8]',
    dotClassName: 'bg-[#2b90a8]',
  },
  {
    label: 'Иконичный образ',
    shortLabel: 'Икона',
    badgeClassName: 'border-[#7b5520] bg-[#fff5d6] text-[#4b320b]',
    barClassName: 'bg-[#c99220]',
    borderClassName: 'border-[#c99220]',
    dotClassName: 'bg-[#c99220]',
  },
]

export function getMatchScoreTone(score: number): MatchScoreTone {
  if (score <= 5) return MATCH_SCORE_TONES[0]
  if (score <= 11) return MATCH_SCORE_TONES[1]
  if (score <= 17) return MATCH_SCORE_TONES[2]
  if (score <= 23) return MATCH_SCORE_TONES[3]
  if (score <= 29) return MATCH_SCORE_TONES[4]
  return MATCH_SCORE_TONES[5]
}
