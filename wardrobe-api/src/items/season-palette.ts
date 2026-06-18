import chroma from 'chroma-js';
import { SeasonPalette } from './dto/item.dto';

type SeasonKey =
  | SeasonPalette.Spring
  | SeasonPalette.Summer
  | SeasonPalette.Autumn
  | SeasonPalette.Winter;

const PALETTE: Record<SeasonKey, string[]> = {
  [SeasonPalette.Spring]: [
    '#FDF3DC',
    '#CFE8FF',
    '#DFF6A3',
    '#FFF7A8',
    '#FFE6CF',
    '#FBD4AF',
    '#8AC4FF',
    '#BFE86A',
    '#FFE23B',
    '#FFB8AA',
    '#F6A977',
    '#5D99D8',
    '#C7E2B0',
    '#F58C92',
    '#F7C644',
    '#E6845B',
    '#2354B9',
    '#1E5A37',
    '#F0678F',
    '#FF8A24',
    '#5A3A23',
    '#132F64',
    '#1F8E55',
    '#D44A4D',
    '#E12A28',
  ],
  [SeasonPalette.Summer]: [
    '#E9C6CC',
    '#F9F5EC',
    '#D5F1DF',
    '#1E315B',
    '#FFF2BF',
    '#C4909E',
    '#D8C4E6',
    '#B7C6AD',
    '#10172E',
    '#CFEFF0',
    '#BF7F8F',
    '#B49BC7',
    '#E3E7FA',
    '#C7C3D5',
    '#6E8DDA',
    '#D87794',
    '#A06C67',
    '#9CC7EC',
    '#7D84D7',
    '#555C68',
    '#7E1632',
    '#5A3435',
    '#3D7A90',
    '#4F4A63',
    '#6A5A4F',
  ],
  [SeasonPalette.Autumn]: [
    '#3B2518',
    '#153624',
    '#3A4A21',
    '#7C4A27',
    '#7D2620',
    '#C35A1E',
    '#4A2343',
    '#5A6429',
    '#C4971B',
    '#B5694B',
    '#B67445',
    '#2D5952',
    '#7A7B42',
    '#E46A1C',
    '#8E6A4A',
    '#F1B5A4',
    '#4B7A6D',
    '#C6D0A6',
    '#DE8C2C',
    '#7A573A',
    '#F4C28F',
    '#C3C5DF',
    '#F0C52F',
    '#F6A86A',
    '#D28B68',
  ],
  [SeasonPalette.Winter]: [
    '#800018',
    '#052116',
    '#061533',
    '#6E0048',
    '#3A0014',
    '#C0001E',
    '#0D3A23',
    '#3C0D6E',
    '#FF2C9D',
    '#000000',
    '#E01021',
    '#008A4F',
    '#1D4FD7',
    '#E4F4FF',
    '#8D96A3',
    '#A0164E',
    '#7ED321',
    '#005A60',
    '#F2E6FA',
    '#4C545D',
    '#FF4F94',
    '#FFF800',
    '#FFD9D1',
    '#FEF5FA',
    '#FFFFFF',
  ],
};

type Lab = [number, number, number];

const PALETTE_LAB: { season: SeasonKey; lab: Lab }[] = (
  Object.entries(PALETTE) as [SeasonKey, string[]][]
).flatMap(([season, hexes]) =>
  hexes.map((hex) => ({ season, lab: chroma(hex).lab() })),
);

const SECOND_SEASON_MARGIN = 8;

function labDistance(a: Lab, b: Lab): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2,
  );
}

export function classifySeasons(hex: string): SeasonPalette[] {
  const lab = chroma(hex).lab();

  const bestPerSeason = new Map<SeasonKey, number>();
  for (const entry of PALETTE_LAB) {
    const d = labDistance(lab, entry.lab);
    const current = bestPerSeason.get(entry.season);
    if (current === undefined || d < current) {
      bestPerSeason.set(entry.season, d);
    }
  }

  const sorted = [...bestPerSeason.entries()].sort((a, b) => a[1] - b[1]);
  const seasons: SeasonPalette[] = [sorted[0][0]];
  if (sorted[1] && sorted[1][1] - sorted[0][1] <= SECOND_SEASON_MARGIN) {
    seasons.push(sorted[1][0]);
  }
  return seasons;
}
