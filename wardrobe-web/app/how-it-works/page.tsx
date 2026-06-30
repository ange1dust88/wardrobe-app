'use client'

import { Infinity as InfinityIcon, Layers, Square } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { BrandMark } from '@/components/BrandMark'
import { SCORE_TIER_COLORS } from '@/lib/match-score'
import { BRAND_ACCENT } from '@/lib/theme'

const ACCENT = BRAND_ACCENT

const SECTIONS: [string, string][] = [
  ['quickstart', 'Quick start'],
  ['adding', 'Adding a piece'],
  ['using', 'Using it'],
  ['harmony', 'The harmony score'],
  ['color', 'Color, in depth'],
  ['rules', 'Rules & overrides'],
  ['slots', 'Slots & layering'],
]

const SIGNALS = [
  {
    name: 'Color',
    pts: 12,
    desc: 'Neutrals go with everything; neighbours or opposites on the wheel work best; two loud colors fight. A second (accent) color earns a little extra when it picks up the other piece’s main shade.',
  },
  {
    name: 'Role',
    pts: 6,
    desc: 'A calm base with one statement reads intentional. Two vivid pops clash.',
  },
  {
    name: 'Season',
    pts: 5,
    desc: 'Same-weather pieces pair best; summer-only with winter-only is penalised hard.',
  },
  {
    name: 'Palette',
    pts: 5,
    desc: 'Your seasonal type boosts shades that suit you and docks ones that fight it.',
  },
  {
    name: 'Style',
    pts: 5,
    desc: 'Mostly formality — loungewear with a suit clashes; a small bonus when the style tags (minimal, edgy, romantic…) agree.',
  },
  {
    name: 'Pattern',
    pts: 3,
    desc: 'One patterned piece is fine; two bold patterns together clash.',
  },
]

const EXAMPLE = {
  a: { name: 'Grey trousers', color: '#8c857a' },
  b: { name: 'Navy striped shirt', color: '#2c3550' },
  total: 28,
  tier: { label: 'Great match', color: SCORE_TIER_COLORS.great },
  breakdown: [
    { name: 'Color', pts: 9, cap: 12 },
    { name: 'Role', pts: 6, cap: 6 },
    { name: 'Season', pts: 5, cap: 5 },
    { name: 'Palette', pts: 3, cap: 5 },
    { name: 'Vibe', pts: 2, cap: 5 },
    { name: 'Pattern', pts: 3, cap: 3 },
  ],
  why: 'A neutral base, one calm stripe, same seasons — an easy, polished pair.',
}

const READ_SWATCHES = [
  '#1a1815',
  '#8c857a',
  '#ece7dd',
  '#cf6a3c',
  '#26303f',
  '#2aa79b',
  '#7a2230',
  '#c9a227',
  '#3d5a3d',
  '#b07d8f',
]

const RELATIONS = [
  { key: 'same', name: 'Same shade', range: '0–12°' },
  { key: 'analog', name: 'Analogous', range: '≤ 35°' },
  { key: 'soft', name: 'Soft contrast', range: '35–70°' },
  { key: 'off', name: 'Off-angle', range: '70–105°' },
  { key: 'split', name: 'Split / triadic', range: '105–165°' },
  { key: 'comp', name: 'Complementary', range: '≥ 165°' },
]

const REL_META: Record<string, { name: string; tag: string; tier: string }> = {
  same: { name: 'Same shade', tag: 'TONAL', tier: '#8c857a' },
  analog: { name: 'Analogous', tag: 'BEST', tier: '#2f7d4f' },
  soft: { name: 'Soft contrast', tag: 'OKAY', tier: '#c08a2d' },
  off: { name: 'Off-angle', tag: 'WEAKEST', tier: '#b5483a' },
  split: { name: 'Split / triadic', tag: 'GOOD', tier: '#2f7d4f' },
  comp: { name: 'Complementary', tag: 'BEST', tier: '#2f5d8a' },
}

const HUE_RING =
  'conic-gradient(from 90deg,#e23d3d,#e2a23d,#d9e23d,#5fe23d,#3de2a2,#3dd9e2,#3d5fe2,#a23de2,#e23da2,#e23d3d)'

function hslOf(hex: string) {
  let h = (hex || '#888').replace('#', '')
  if (h.length === 3)
    h = h
      .split('')
      .map(c => c + c)
      .join('')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  let H = 0
  let S = 0
  const L = (mx + mn) / 2
  if (mx !== mn) {
    const d = mx - mn
    S = L > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
    if (mx === r) H = (g - b) / d + (g < b ? 6 : 0)
    else if (mx === g) H = (b - r) / d + 2
    else H = (r - g) / d + 4
    H *= 60
  }
  return { h: H, s: S, l: L }
}

function classify(diff: number): string {
  if (diff <= 12) return 'same'
  if (diff <= 35) return 'analog'
  if (diff <= 70) return 'soft'
  if (diff <= 105) return 'off'
  if (diff < 165) return 'split'
  return 'comp'
}

const SECTION_KICKER: Record<string, string> = {
  quickstart: 'Step by step',
  adding: 'Your wardrobe',
  using: 'Find & build',
  harmony: 'The math, plainly',
  color: 'The biggest signal',
  rules: 'Two kinds of no',
  slots: 'How many at once',
}

export default function HowItWorks() {
  const [heroN, setHeroN] = useState(0)
  const [active, setActive] = useState('quickstart')
  const [readColor, setReadColor] = useState('#cf6a3c')
  const [slider, setSlider] = useState(28)
  const [h1, setH1] = useState(18)
  const [h2, setH2] = useState(208)
  const [drag, setDrag] = useState(0)
  const wheelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let n = 0
    const iv = setInterval(() => {
      n += 2
      if (n >= 28) {
        n = 28
        clearInterval(iv)
      }
      setHeroN(n)
    }, 28)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    function move(e: PointerEvent) {
      if (!drag || !wheelRef.current) return
      const r = wheelRef.current.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      let deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
      deg = (deg + 360) % 360
      if (drag === 1) setH1(deg)
      else setH2(deg)
    }
    function up() {
      setDrag(0)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [drag])

  function navTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 84
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const cx = 110
  const cy = 110
  const R = 92
  const a1 = (h1 * Math.PI) / 180
  const a2 = (h2 * Math.PI) / 180
  const h1x = cx + R * Math.cos(a1)
  const h1y = cy + R * Math.sin(a1)
  const h2x = cx + R * Math.cos(a2)
  const h2y = cy + R * Math.sin(a2)
  let diff = Math.abs(h1 - h2) % 360
  if (diff > 180) diff = 360 - diff
  const relKey = classify(diff)
  const meta = REL_META[relKey]

  const v = slider
  const pct = v / 36
  const tier =
    pct < 0.6
      ? { label: 'Below the bar', color: '#a39c8e', note: 'Under ~60% — not surfaced as a suggestion, but you can still pick it by hand.' }
      : pct < 0.75
        ? { label: 'Works', color: SCORE_TIER_COLORS.works, note: '60–74% — a solid, wearable pairing.' }
        : pct < 0.9
          ? { label: 'Great match', color: SCORE_TIER_COLORS.great, note: '75–89% — these clearly belong together.' }
          : { label: 'Perfect match', color: SCORE_TIER_COLORS.perfect, note: '90%+ — about as good as it gets.' }

  const c = hslOf(readColor)
  const neutral = c.s < 0.18 || c.l < 0.14 || c.l > 0.9
  const temp = neutral
    ? { label: 'Neutral', color: '#8c857a' }
    : c.h < 70 || c.h > 300
      ? { label: 'Warm', color: '#cf6a3c' }
      : { label: 'Cool', color: '#2f5d8a' }
  const bright = c.l > 0.62 ? 'Light' : c.l < 0.32 ? 'Dark' : 'Mid'
  const sat = c.s < 0.18 ? 'Muted' : c.s > 0.55 ? 'Vivid' : 'Soft'
  const role = neutral
    ? { label: 'Core', color: '#5c564c' }
    : c.s > 0.5 && c.l > 0.3 && c.l < 0.7
      ? { label: 'Pop', color: '#b5483a' }
      : { label: 'Tonal', color: '#2f7d4f' }

  function handleStyle(x: number, y: number, hue: number, on: boolean): React.CSSProperties {
    return {
      position: 'absolute',
      left: x - 13,
      top: y - 13,
      width: 26,
      height: 26,
      borderRadius: '50%',
      background: `hsl(${Math.round(hue)} 72% 52%)`,
      border: '3px solid #fff',
      boxShadow: `0 2px 8px rgba(26,24,21,.3)${on ? `, 0 0 0 4px ${ACCENT}55` : ''}`,
      cursor: 'grab',
      touchAction: 'none',
      zIndex: 3,
    }
  }

  const kicker = (id: string) => (
    <div className='mb-2.5 text-[12px] font-bold tracking-[0.16em] text-muted-foreground uppercase'>
      {SECTION_KICKER[id]}
    </div>
  )

  const h2cls =
    'font-heading text-[32px] font-bold tracking-tight leading-none'
  const introCls = 'mt-2 mb-6 text-[16px] leading-relaxed text-muted-foreground'

  return (
    <main className='min-h-svh bg-background'>
      <style>{`
        .guide-range{-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer}
        .guide-range::-webkit-slider-runnable-track{height:6px;border-radius:6px;background:transparent}
        .guide-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fbfaf6;border:none;box-shadow:0 2px 8px rgba(0,0,0,.4);margin-top:-8px}
        .guide-range::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#fbfaf6;border:none;box-shadow:0 2px 8px rgba(0,0,0,.4)}
      `}</style>

      <header className='sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md sm:px-8'>
        <BrandMark size={20} />
        <span className='text-[12px] font-bold tracking-[0.16em] text-muted-foreground uppercase'>
          The guide
        </span>
      </header>

      <section className='mx-auto max-w-[760px] px-6 pt-16 pb-7 text-center sm:px-8'>
        <div className='text-[12px] font-bold tracking-[0.2em] text-muted-foreground uppercase'>
          Everything dress does
        </div>
        <h1 className='font-heading mx-auto mt-4 max-w-[640px] text-[clamp(36px,6vw,58px)] leading-[1.03] font-bold tracking-tight text-balance'>
          From a closet of photos to outfits that work
        </h1>
        <p className='mx-auto mt-5 max-w-[520px] text-[17px] leading-relaxed text-muted-foreground'>
          It scores how well any two pieces go together, then helps you stack
          them into looks.
        </p>
        <div
          className='mt-7 inline-flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-white shadow-lg'
          style={{ background: ACCENT, boxShadow: `0 10px 30px ${ACCENT}52` }}
        >
          <span className='font-heading text-[32px] leading-none font-extrabold'>
            {heroN}
          </span>
          <span className='text-[15px] opacity-80'>/ 36</span>
          <span className='h-5 w-px bg-white/30' />
          <span className='text-[14px] font-semibold'>
            {heroN >= 24 ? 'In harmony' : 'styling…'}
          </span>
        </div>
      </section>

      <div className='mx-auto flex max-w-[1140px] gap-10 px-6 pt-6 pb-28 sm:px-8 lg:gap-12'>
        <aside className='hidden flex-none lg:block lg:w-[180px]'>
          <div className='sticky top-24'>
            <div className='mb-4 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase'>
              On this page
            </div>
            <div className='flex flex-col gap-0.5'>
              {SECTIONS.map(([id, label]) => {
                const on = active === id
                return (
                  <button
                    key={id}
                    type='button'
                    onClick={() => navTo(id)}
                    className='rounded-lg py-[7px] pr-3 pl-3 text-left text-[14px] transition-colors'
                    style={{
                      fontWeight: on ? 700 : 500,
                      color: on ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                      borderLeft: `2px solid ${on ? ACCENT : 'transparent'}`,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        <div className='min-w-0 flex-1 lg:max-w-[760px]'>
          <section
            id='quickstart'
            className='mb-[84px] scroll-mt-24'
          >
            {kicker('quickstart')}
            <h2 className={h2cls}>Quick start</h2>
            <p className={introCls}>
              Three moves and you have your first scored outfit.
            </p>
            <div className='grid gap-3.5 sm:grid-cols-3'>
              {[
                ['1', 'Set your color type', 'Pick your seasonal palette — it quietly tunes every score to suit you.'],
                ['2', 'Add your pieces', 'Snap a photo — we read the color — or pick a swatch. Tag it and go.'],
                ['3', 'Build a look', 'Tap a piece, matches light up with scores. Stack, name it, save.'],
              ].map(([n, title, text]) => (
                <div
                  key={n}
                  className='rounded-[18px] border border-border bg-card p-5 shadow-sm'
                >
                  <div
                    className='font-heading mb-3.5 flex size-8 items-center justify-center rounded-full text-[15px] font-bold text-white'
                    style={{ background: ACCENT }}
                  >
                    {n}
                  </div>
                  <div className='text-[16px] font-bold'>{title}</div>
                  <div className='mt-1 text-[14px] leading-snug text-muted-foreground'>
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            id='adding'
            className='mb-[84px] scroll-mt-24'
          >
            {kicker('adding')}
            <h2 className={h2cls}>Adding a piece</h2>
            <p className={introCls}>
              You set a few things — the rest we read from the color.
            </p>

            <div className='mb-3 text-[13px] font-bold text-foreground'>You set</div>
            <div className='mb-8 flex flex-wrap gap-2'>
              {[
                'Photo',
                'Color',
                'Type · subtype',
                'Pattern',
                'Vibe',
                'Seasons',
              ].map(p => (
                <span
                  key={p}
                  className='rounded-[11px] border border-border bg-card px-3.5 py-2 text-[13.5px] font-semibold'
                >
                  {p}
                </span>
              ))}
            </div>

            <div
              className='rounded-[20px] border p-6'
              style={{ borderColor: `${ACCENT}40`, background: `${ACCENT}10` }}
            >
              <div className='text-[17px] font-bold'>What we read for you</div>
              <div className='mt-0.5 mb-5 text-[14px] text-muted-foreground'>
                Tap a color — these are derived the moment you save.
              </div>
              <div className='mb-5 flex flex-wrap gap-2.5'>
                {READ_SWATCHES.map(col => (
                  <button
                    key={col}
                    type='button'
                    aria-label={col}
                    onClick={() => setReadColor(col)}
                    className='size-[38px] rounded-[10px] border border-black/10'
                    style={{
                      background: col,
                      boxShadow:
                        readColor === col
                          ? `0 0 0 2px var(--color-background), 0 0 0 4px ${ACCENT}`
                          : undefined,
                    }}
                  />
                ))}
              </div>
              <div className='grid grid-cols-2 gap-2.5 sm:grid-cols-4'>
                {[
                  { k: 'Temperature', val: temp.label, color: temp.color },
                  { k: 'Brightness', val: bright, color: undefined },
                  { k: 'Saturation', val: sat, color: undefined },
                  { k: 'Role', val: role.label, color: role.color },
                ].map(item => (
                  <div key={item.k} className='rounded-[14px] bg-card p-4'>
                    <div className='mb-1.5 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase'>
                      {item.k}
                    </div>
                    <div
                      className='font-heading text-[19px] font-bold'
                      style={item.color ? { color: item.color } : undefined}
                    >
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id='using' className='mb-[84px] scroll-mt-24'>
            {kicker('using')}
            <h2 className={h2cls}>Using it</h2>
            <p className={introCls}>
              Find matches on the wheel, then stack them into a look.
            </p>

            <div className='mb-8 flex flex-col gap-3.5'>
              {[
                ['Hover to preview', "Point at a piece and its matches light up with score badges — nothing's added yet."],
                ['Circular & list views', 'The wheel lays it head-to-toe; the list is an outfit carousel — same scores.'],
                ['Grayed-out pieces', 'Too low to recommend with your current pick, but never locked — pick it anyway.'],
              ].map(([title, text]) => (
                <div key={title} className='flex gap-3'>
                  <span
                    className='mt-[7px] size-1.5 flex-none rounded-full'
                    style={{ background: ACCENT }}
                  />
                  <div className='text-[14.5px] leading-relaxed'>
                    <span className='font-bold'>{title}</span>
                    <span className='text-muted-foreground'> — {text}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className='mb-4 text-[13px] font-bold text-foreground'>
              Then build the look
            </div>
            <div className='flex flex-col border-l-2 border-border pl-6'>
              {[
                ['Add pieces', 'Tapping adds them — selection follows realistic slot rules.'],
                ['Watch the harmony', 'Two+ pieces give a score: the average match across every pair.'],
                ['Handle conflicts', "A notice if two pieces don't belong — wear it anyway, or swap."],
                ['Save it', 'Name it and it lands under Outfits, harmony and all.'],
              ].map(([title, text], i, arr) => (
                <div
                  key={title}
                  className='relative'
                  style={{ paddingBottom: i === arr.length - 1 ? 0 : 22 }}
                >
                  <span
                    className='absolute top-0.5 size-3.5 rounded-full border-[3px]'
                    style={{
                      left: -31,
                      background: ACCENT,
                      borderColor: 'var(--color-background)',
                    }}
                  />
                  <div className='text-[15.5px] font-bold'>{title}</div>
                  <div className='text-[14px] text-muted-foreground'>{text}</div>
                </div>
              ))}
            </div>

            <div className='mt-7 rounded-[18px] border border-border bg-card p-5 shadow-sm'>
              <div className='mb-3 flex items-center justify-between'>
                <span className='text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase'>
                  Your look
                </span>
                <span
                  className='flex items-baseline gap-1 rounded-lg px-2.5 py-1 text-white'
                  style={{ background: '#2f7d4f' }}
                >
                  <span className='font-heading text-[15px] leading-none font-extrabold'>
                    28
                  </span>
                  <span className='text-[11px] opacity-80'>/ 36</span>
                </span>
              </div>
              <div className='flex flex-col gap-2'>
                {[
                  ['Navy striped shirt', 'top', '#2c3550'],
                  ['Grey trousers', 'bottom', '#8c857a'],
                  ['White sneakers', 'shoes', '#ece7dd'],
                ].map(([name, cat, col]) => (
                  <div key={name} className='flex items-center gap-3'>
                    <span
                      className='size-8 flex-none rounded-lg border border-black/10'
                      style={{ background: col }}
                    />
                    <span className='text-[14px] font-semibold'>{name}</span>
                    <span className='ml-auto text-[11px] tracking-wide text-muted-foreground uppercase'>
                      {cat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            id='harmony'
            className='mb-[84px] scroll-mt-24'
          >
            {kicker('harmony')}
            <h2 className={h2cls}>The harmony score</h2>
            <p className={introCls}>
              Every pair scores out of 36. Six signals add up — here&apos;s how
              much each can weigh.
            </p>

            <div className='mb-7 rounded-[20px] border border-border bg-card p-6 shadow-sm'>
              {SIGNALS.map((s, i) => (
                <div key={s.name} style={{ marginBottom: i === SIGNALS.length - 1 ? 0 : 16 }}>
                  <div className='mb-1.5 flex items-baseline justify-between'>
                    <span className='text-[15px] font-bold'>{s.name}</span>
                    <span className='text-[13px] text-muted-foreground'>
                      <b className='font-heading text-[15px] text-foreground'>
                        {s.pts}
                      </b>{' '}
                      pts
                    </span>
                  </div>
                  <div className='h-2 overflow-hidden rounded-full bg-muted'>
                    <div
                      className='h-full rounded-full'
                      style={{ width: `${(s.pts / 12) * 100}%`, background: ACCENT }}
                    />
                  </div>
                  <div className='mt-1.5 text-[13px] leading-snug text-muted-foreground'>
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>

            <div
              className='rounded-[20px] p-6 text-white'
              style={{ background: 'var(--color-foreground)' }}
            >
              <div className='flex flex-wrap items-baseline justify-between gap-2'>
                <div className='text-[16px] font-bold'>Reading the number</div>
                <div className='text-[13px] text-white/55'>drag to feel the tiers</div>
              </div>
              <div className='my-3.5 flex items-baseline gap-2.5'>
                <span
                  className='font-heading text-[46px] leading-none font-extrabold'
                  style={{ color: tier.color }}
                >
                  {v}
                </span>
                <span className='text-[16px] text-white/55'>/ 36</span>
                <span
                  className='ml-auto text-[16px] font-bold'
                  style={{ color: tier.color }}
                >
                  {tier.label}
                </span>
              </div>
              <div className='relative flex h-6 items-center'>
                <div
                  className='absolute right-0 left-0 h-1.5 rounded-full'
                  style={{
                    background: `linear-gradient(90deg,#a39c8e 0 60%,${SCORE_TIER_COLORS.works} 60% 75%,${SCORE_TIER_COLORS.great} 75% 90%,${SCORE_TIER_COLORS.perfect} 90% 100%)`,
                  }}
                />
                <input
                  type='range'
                  min={0}
                  max={36}
                  step={1}
                  value={v}
                  onChange={e => setSlider(+e.target.value)}
                  className='guide-range relative w-full'
                />
              </div>
              <div className='mt-3.5 text-[13.5px] leading-relaxed text-white/75'>
                {tier.note}
              </div>
            </div>

            <div className='mt-5 rounded-[20px] border border-border bg-card p-6 shadow-sm'>
              <div className='mb-3 text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase'>
                A real example
              </div>
              <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
                <span className='flex items-center gap-2'>
                  <span
                    className='size-5 rounded-md border border-black/10'
                    style={{ background: EXAMPLE.a.color }}
                  />
                  <span className='text-[14px] font-semibold'>{EXAMPLE.a.name}</span>
                </span>
                <span className='text-muted-foreground'>×</span>
                <span className='flex items-center gap-2'>
                  <span
                    className='size-5 rounded-md border border-black/10'
                    style={{ background: EXAMPLE.b.color }}
                  />
                  <span className='text-[14px] font-semibold'>{EXAMPLE.b.name}</span>
                </span>
                <span
                  className='ml-auto flex items-baseline gap-1.5 rounded-xl px-3 py-1 text-white'
                  style={{ background: EXAMPLE.tier.color }}
                >
                  <span className='font-heading text-[18px] leading-none font-extrabold'>
                    {EXAMPLE.total}
                  </span>
                  <span className='text-[12px] opacity-80'>/ 36</span>
                  <span className='text-[12px] font-semibold'>· {EXAMPLE.tier.label}</span>
                </span>
              </div>
              <div className='mt-4 flex flex-col gap-2'>
                {EXAMPLE.breakdown.map(b => (
                  <div key={b.name} className='flex items-center gap-3'>
                    <span className='w-[58px] flex-none text-[13px] font-semibold'>
                      {b.name}
                    </span>
                    <span className='h-2 flex-1 overflow-hidden rounded-full bg-muted'>
                      <span
                        className='block h-full rounded-full'
                        style={{ width: `${(b.pts / b.cap) * 100}%`, background: ACCENT }}
                      />
                    </span>
                    <span className='w-7 flex-none text-right text-[13px] font-bold text-muted-foreground'>
                      +{b.pts}
                    </span>
                  </div>
                ))}
              </div>
              <p className='mt-4 text-[13px] leading-relaxed text-muted-foreground'>
                {EXAMPLE.why} An outfit&apos;s harmony averages a score like this
                across every pair.
              </p>
            </div>
          </section>

          <section
            id='color'
            className='mb-[84px] scroll-mt-24'
          >
            {kicker('color')}
            <h2 className={h2cls}>Color, in depth</h2>
            <p className={introCls}>
              Up to 12 of the 36 points. Drag the two dots — the relationship
              classifies live.
            </p>

            <div className='mb-7 flex flex-wrap items-center justify-center gap-8 rounded-[22px] border border-border bg-card p-6 shadow-sm'>
              <div
                ref={wheelRef}
                className='relative flex-none'
                style={{ width: 220, height: 220, touchAction: 'none' }}
              >
                <div
                  className='absolute inset-0 rounded-full'
                  style={{ background: HUE_RING }}
                />
                <div
                  className='absolute rounded-full bg-card'
                  style={{ inset: 34 }}
                />
                <svg
                  viewBox='0 0 220 220'
                  width={220}
                  height={220}
                  className='pointer-events-none absolute inset-0'
                  aria-hidden='true'
                >
                  <line
                    x1={h1x}
                    y1={h1y}
                    x2={h2x}
                    y2={h2y}
                    stroke='var(--color-foreground)'
                    strokeWidth={2}
                    strokeOpacity={0.55}
                  />
                </svg>
                <div
                  onPointerDown={e => {
                    e.preventDefault()
                    setDrag(1)
                  }}
                  style={handleStyle(h1x, h1y, h1, drag === 1)}
                />
                <div
                  onPointerDown={e => {
                    e.preventDefault()
                    setDrag(2)
                  }}
                  style={handleStyle(h2x, h2y, h2, drag === 2)}
                />
                <div className='pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'>
                  <div className='font-heading text-[30px] leading-none font-extrabold'>
                    {Math.round(diff)}°
                  </div>
                  <div className='text-[11px] tracking-wide text-muted-foreground'>
                    apart
                  </div>
                </div>
              </div>

              <div className='min-w-[220px] flex-1'>
                <div className='mb-1 text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase'>
                  This pairing reads
                </div>
                <div className='mb-3.5 flex items-center gap-2.5'>
                  <span className='font-heading text-[24px] font-bold'>
                    {meta.name}
                  </span>
                  <span
                    className='rounded-[7px] px-2.5 py-1 text-[11px] font-bold tracking-[0.1em] text-white'
                    style={{ background: meta.tier }}
                  >
                    {meta.tag}
                  </span>
                </div>
                <div className='flex flex-col gap-1.5'>
                  {RELATIONS.map(r => {
                    const on = r.key === relKey
                    return (
                      <div
                        key={r.key}
                        className='flex items-center rounded-[9px] px-3 py-[7px] transition-colors'
                        style={{
                          background: on ? ACCENT : 'transparent',
                          color: on ? '#fff' : 'var(--color-foreground)',
                        }}
                      >
                        <span className='text-[13.5px] font-semibold'>{r.name}</span>
                        <span
                          className='ml-auto text-[12.5px]'
                          style={{ color: on ? 'rgba(255,255,255,.8)' : 'var(--color-muted-foreground)' }}
                        >
                          {r.range}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div
              className='mb-7 rounded-[18px] border p-6'
              style={{ borderColor: `${ACCENT}40`, background: `${ACCENT}10` }}
            >
              <div className='text-[16px] font-bold'>Neutrals are the easy win</div>
              <div className='mt-1.5 mb-3.5 text-[14px] leading-relaxed text-muted-foreground'>
                Black, white, grey, cream — very low saturation — go with almost
                anything. A neutral beside one bright pop is the safest strong
                pairing.
              </div>
              <div className='flex flex-wrap items-center gap-2.5'>
                {['#1a1815', '#4a443b', '#8c857a', '#c7bfae', '#ece7dd'].map(col => (
                  <span
                    key={col}
                    className='size-[26px] rounded-[7px] border border-black/10'
                    style={{ background: col }}
                  />
                ))}
                <span className='font-bold text-muted-foreground'>+</span>
                <span
                  className='size-[26px] rounded-[7px]'
                  style={{ background: '#2aa79b' }}
                />
                <span className='text-[13px] font-semibold text-muted-foreground'>
                  neutral + one pop
                </span>
              </div>
            </div>

            <div className='mb-3 text-[13px] font-bold text-foreground'>
              Then three smaller signals tune it
            </div>
            <div className='grid gap-3.5 sm:grid-cols-3'>
              <div className='rounded-[18px] border border-border bg-card p-[18px] shadow-sm'>
                <div className='mb-2.5 flex items-center justify-between'>
                  <span className='text-[15px] font-bold'>Temperature</span>
                  <span className='flex gap-1.5'>
                    <span className='size-[18px] rounded-full' style={{ background: '#e08a2c' }} />
                    <span className='size-[18px] rounded-full' style={{ background: '#2f7dc4' }} />
                  </span>
                </div>
                <div className='text-[13.5px] leading-snug text-muted-foreground'>
                  Warm-with-warm or cool-with-cool adds a point; mixing docks one.
                </div>
              </div>
              <div className='rounded-[18px] border border-border bg-card p-[18px] shadow-sm'>
                <div className='mb-2.5 flex items-center justify-between'>
                  <span className='text-[15px] font-bold'>Brightness</span>
                  <span
                    className='h-[18px] w-[42px] rounded-full'
                    style={{ background: 'linear-gradient(90deg,#c9d3df,#26303f)' }}
                  />
                </div>
                <div className='text-[13.5px] leading-snug text-muted-foreground'>
                  Matching lightness helps; a big light-vs-dark jump costs a
                  little.
                </div>
              </div>
              <div className='rounded-[18px] border border-border bg-card p-[18px] shadow-sm'>
                <div className='mb-2.5 flex items-center justify-between'>
                  <span className='text-[15px] font-bold'>Saturation</span>
                  <span className='flex gap-1.5'>
                    <span className='size-[18px] rounded-[5px]' style={{ background: '#e0218a' }} />
                    <span className='size-[18px] rounded-[5px]' style={{ background: '#a86b86' }} />
                  </span>
                </div>
                <div className='text-[13.5px] leading-snug text-muted-foreground'>
                  Two loud, vivid colors fight. One vivid against a calmer one is
                  the sweet spot.
                </div>
              </div>
            </div>
          </section>

          <section
            id='rules'
            className='mb-[84px] scroll-mt-24'
          >
            {kicker('rules')}
            <h2 className={h2cls}>Rules &amp; overrides</h2>
            <p className={introCls}>
              Some combos are filtered out; others just earn a low score.
            </p>
            <div className='mb-5 flex flex-col gap-3'>
              {[
                ['dress', 'top · bottom', '— a dress is the whole look on its own.'],
                ['summer piece', 'winter piece', '— made for opposite weather.'],
              ].map(([l, r, note]) => (
                <div
                  key={l}
                  className='flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[14px] border border-border bg-card p-4 shadow-sm'
                >
                  <span className='rounded-lg bg-muted px-3 py-1 text-[13.5px] font-semibold'>
                    {l}
                  </span>
                  <span className='font-bold' style={{ color: '#b5483a' }}>
                    ✕
                  </span>
                  <span className='rounded-lg bg-muted px-3 py-1 text-[13.5px] font-semibold'>
                    {r}
                  </span>
                  <span className='text-[13.5px] text-muted-foreground'>{note}</span>
                </div>
              ))}
            </div>
            <div className='flex flex-wrap gap-3.5'>
              <div
                className='min-w-[240px] flex-1 rounded-2xl border p-[18px]'
                style={{ borderColor: `${ACCENT}40`, background: `${ACCENT}10` }}
              >
                <div className='mb-1 text-[15px] font-bold'>Overridable</div>
                <div className='text-[13.5px] leading-relaxed text-muted-foreground'>
                  Structural clashes are kept out of suggestions — but “Wear it
                  anyway” lets you force a deliberate look.
                </div>
              </div>
              <div
                className='min-w-[240px] flex-1 rounded-2xl p-[18px] text-white'
                style={{ background: 'var(--color-foreground)' }}
              >
                <div className='mb-1 text-[15px] font-bold'>Honest, never faked</div>
                <div className='text-[13.5px] leading-relaxed text-white/70'>
                  Clashing colors and loud patterns aren&apos;t blocked — they
                  just earn a low number. A bad combo gets a small score.
                </div>
              </div>
            </div>
          </section>

          <section
            id='slots'
            className='scroll-mt-24'
          >
            {kicker('slots')}
            <h2 className={h2cls}>Slots &amp; layering</h2>
            <p className={introCls}>
              Kept realistic — so two pairs of shoes never happen.
            </p>
            <div className='grid gap-3.5 sm:grid-cols-3'>
              {[
                { Icon: Square, title: 'One at a time', items: 'shoes · dress · headwear', text: 'A single piece per slot — picking another swaps it.' },
                { Icon: Layers, title: 'Layer it yourself', items: 'top · outerwear · bottom', text: 'A tee under a sweater, leggings under a skirt — add layers by hand.' },
                { Icon: InfinityIcon, title: 'As many as you like', items: 'accessory — bag · jewelry · belt', text: 'Finishing pieces stack freely — no limit.' },
              ].map(slot => (
                <div
                  key={slot.title}
                  className='rounded-[18px] border border-border bg-card p-5 shadow-sm'
                >
                  <slot.Icon className='mb-2.5 size-6' style={{ color: ACCENT }} />
                  <div className='text-[15px] font-bold'>{slot.title}</div>
                  <div className='mb-2 text-[12.5px] tracking-wide text-muted-foreground'>
                    {slot.items}
                  </div>
                  <div className='text-[13.5px] leading-snug text-muted-foreground'>
                    {slot.text}
                  </div>
                </div>
              ))}
            </div>

            <Link
              href='/'
              className='mt-10 inline-block text-[13px] font-medium text-muted-foreground hover:text-foreground'
            >
              ← Back to wardrobe
            </Link>
          </section>
        </div>
      </div>
    </main>
  )
}
