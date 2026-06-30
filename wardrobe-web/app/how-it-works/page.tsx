import Link from 'next/link'

const ACCENT = '#3d5a3d'
const MAX_AXIS = 12

const TOC = [
  { id: 'start', label: 'Quick start' },
  { id: 'adding', label: 'Adding a piece' },
  { id: 'browse', label: 'Browsing' },
  { id: 'building', label: 'Building an outfit' },
  { id: 'score', label: 'The harmony score' },
  { id: 'color', label: 'Color, in depth' },
  { id: 'rules', label: 'Rules & overrides' },
  { id: 'slots', label: 'Slots & layering' },
]

const STEPS = [
  {
    title: 'Set your color type',
    text: 'Onboarding asks for your seasonal palette — spring, summer, autumn or winter. It quietly nudges every score toward shades that suit you, and you can change it anytime from your profile.',
  },
  {
    title: 'Add your pieces',
    text: 'Snap a photo and we read the main color for you, or pick a swatch by hand. Tag the type, pattern, vibe and the seasons you’d wear it.',
  },
  {
    title: 'Build a look',
    text: 'Tap a piece — matching pieces across the other slots light up with a score. Add a few, watch the harmony, name it and save.',
  },
]

const SET_FIELDS = [
  {
    name: 'Photo',
    text: 'Optional, but recommended — we pull the dominant color straight from it. JPG, PNG, WebP or GIF up to 5 MB.',
  },
  {
    name: 'Color',
    text: 'Filled in automatically from the photo. No photo, or want a different shade? Pick the swatch by hand.',
  },
  {
    name: 'Type & subtype',
    text: 'The slot it lives in (top, bottom, shoes…) plus an optional finer type (t-shirt, jeans, heels…). Subtype is what lets layered slots stack one of each — a tee under a sweater.',
  },
  {
    name: 'Pattern',
    text: 'Solid, subtle, bold, graphic or texture. Two loud patterns in one look cost points; everything else mixes freely.',
  },
  {
    name: 'Vibe',
    text: 'One or more style tags — casual, edgy, romantic and so on. Some pairs clash, and the form warns you right as you pick them.',
  },
  {
    name: 'Seasons',
    text: 'When you’d actually reach for it. Pieces made for the same weather pair better; opposite-weather pieces are kept apart.',
  },
]

const AUTO_FIELDS = [
  {
    name: 'Temperature, brightness, saturation',
    text: 'Warm vs cool, light vs dark, muted vs vivid — read from the color so pairings can reason about it.',
  },
  {
    name: 'Role',
    text: 'Each piece becomes a core (neutral base), a tonal (soft color) or a pop (vivid statement). This drives the “calm base + one statement” logic.',
  },
  {
    name: 'Palette fit',
    text: 'Which seasonal color types the shade flatters — compared against your own type to push or dock points.',
  },
]

const AXES = [
  {
    name: 'Color',
    weight: 12,
    text: 'The biggest signal. Neutrals go with everything; colors that sit next to each other (analogous) or opposite (complementary) on the wheel work best; matching warm/cool temperature helps; two loud, vivid colors fight.',
  },
  {
    name: 'Role',
    weight: 6,
    text: 'A core base with one tonal or pop reads intentional. Two vivid pops together clash and lose points.',
  },
  {
    name: 'Season',
    weight: 5,
    text: 'How much the pieces’ wear-seasons overlap. Same-weather pieces pair best; summer-only with winter-only is penalized hard.',
  },
  {
    name: 'Palette',
    weight: 5,
    text: 'Seasonal color type. Your type from onboarding boosts pieces in your palette and docks ones that fight it; universal and neutral shades stay safe either way.',
  },
  {
    name: 'Vibe',
    weight: 5,
    text: 'Style tags like casual, edgy, romantic. Matching vibes score full; known clashers (e.g. sporty + romantic) lose points.',
  },
  {
    name: 'Pattern',
    weight: 3,
    text: 'Solids mix with anything and one patterned piece is fine — but two bold or graphic patterns together clash.',
  },
]

const TONES = [
  {
    band: 'Works',
    range: '60–74%',
    color: '#a68117',
    text: 'Solid, wearable pairing.',
  },
  {
    band: 'Great match',
    range: '75–89%',
    color: '#2f7d4f',
    text: 'These clearly belong together.',
  },
  {
    band: 'Perfect match',
    range: '90%+',
    color: '#245179',
    text: 'About as good as it gets.',
  },
]

const COLOR_WHEEL = [
  {
    name: 'Same shade',
    angle: '0–12°',
    verdict: 'Solid',
    a: 210,
    b: 222,
    text: 'Near-identical hues — a tonal, one-color look. Gets a nudge up when one piece is lighter and one darker.',
  },
  {
    name: 'Analogous',
    angle: '≤ 35°',
    verdict: 'Best',
    a: 150,
    b: 185,
    text: 'Neighbours on the wheel — blue with teal, rust with orange. The easiest strong pairing.',
  },
  {
    name: 'Complementary',
    angle: '≥ 165°',
    verdict: 'Best',
    a: 30,
    b: 210,
    text: 'Opposites — blue with orange, green with red. High contrast, reads deliberate.',
  },
  {
    name: 'Split / triadic',
    angle: '105–165°',
    verdict: 'Good',
    a: 0,
    b: 120,
    text: 'Evenly spaced around the wheel. Works, with a bolder, more playful edge.',
  },
  {
    name: 'Off-angle',
    angle: '70–105°',
    verdict: 'Weakest',
    a: 60,
    b: 150,
    text: 'Neither close enough nor opposite — the awkward middle that scores lowest.',
  },
]

const COLOR_ADJUST = [
  {
    name: 'Temperature',
    text: 'Warm-with-warm or cool-with-cool adds a point. Mixing a warm and a cool color docks points — softened if the two already form a wheel harmony.',
  },
  {
    name: 'Brightness',
    text: 'Matching lightness adds a touch. A big light-vs-dark jump between otherwise similar colors costs a little.',
  },
  {
    name: 'Saturation',
    text: 'Two loud, vivid colors fight — a real penalty. One vivid piece against a calmer one is the sweet spot; two muted tones stay safe.',
  },
]

const STRUCTURAL_RULES = [
  {
    left: 'dress',
    right: 'top · bottom',
    text: 'A dress is the whole look on its own.',
  },
  {
    left: 'summer piece',
    right: 'winter piece',
    text: 'Made for opposite weather.',
  },
]

const STACKING = [
  {
    label: 'One at a time',
    items: 'shoes · dress · headwear',
    text: 'A single piece per slot — picking another swaps it.',
  },
  {
    label: 'Layer it yourself',
    items: 'top · outerwear · bottom',
    text: 'Add layers by hand — a tee under a sweater, leggings under a skirt. Suggestions fill the other slots, not more of the same.',
  },
  {
    label: 'As many as you like',
    items: 'accessory — bag · jewelry · belt · scarf…',
    text: 'Finishing pieces stack freely — no limit.',
  },
]

function SectionHeading({ id, kicker, title, intro }: {
  id: string
  kicker: string
  title: string
  intro: string
}) {
  return (
    <div id={id} className='scroll-mt-8'>
      <div className='text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase'>
        {kicker}
      </div>
      <h2 className='font-heading mt-2 text-[24px] font-bold tracking-tight'>
        {title}
      </h2>
      <p className='mt-2 text-[14.5px] leading-relaxed text-muted-foreground'>
        {intro}
      </p>
    </div>
  )
}

function Swatch({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <span
      className='inline-block flex-none rounded-md border border-black/10'
      style={{ width: size, height: size, background: color }}
    />
  )
}

const HUE_RING =
  'conic-gradient(from 0deg, hsl(0 75% 55%), hsl(60 75% 55%), hsl(120 75% 55%), hsl(180 75% 55%), hsl(240 75% 55%), hsl(300 75% 55%), hsl(360 75% 55%))'

function HueDial({ a, b, size = 78 }: { a: number; b: number; size?: number }) {
  const c = size / 2
  const r = c - 9
  const point = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: c + r * Math.cos(rad), y: c + r * Math.sin(rad) }
  }
  const pa = point(a)
  const pb = point(b)
  return (
    <div className='relative flex-none' style={{ width: size, height: size }}>
      <div
        className='absolute inset-0 rounded-full'
        style={{ background: HUE_RING }}
      />
      <div className='absolute rounded-full bg-card' style={{ inset: 13 }} />
      <svg
        className='absolute inset-0'
        width={size}
        height={size}
        aria-hidden='true'
      >
        <line
          x1={pa.x}
          y1={pa.y}
          x2={pb.x}
          y2={pb.y}
          stroke='var(--color-foreground)'
          strokeWidth='1.5'
          strokeOpacity='0.45'
        />
      </svg>
      {[
        { deg: a, p: pa },
        { deg: b, p: pb },
      ].map(({ deg, p }) => (
        <span
          key={deg}
          className='absolute size-3.5 rounded-full border-2 shadow-sm'
          style={{
            left: p.x,
            top: p.y,
            transform: 'translate(-50%, -50%)',
            background: `hsl(${deg} 75% 50%)`,
            borderColor: 'var(--color-card)',
          }}
        />
      ))}
    </div>
  )
}

function AdjustGraphic({ name }: { name: string }) {
  if (name === 'Temperature') {
    return (
      <div className='flex flex-none items-center gap-1.5'>
        <Swatch color='hsl(28 78% 55%)' />
        <Swatch color='hsl(210 70% 52%)' />
      </div>
    )
  }
  if (name === 'Brightness') {
    return (
      <span
        className='block h-[22px] w-[72px] flex-none rounded-md border border-black/10'
        style={{
          background: 'linear-gradient(90deg, hsl(210 35% 86%), hsl(210 45% 24%))',
        }}
      />
    )
  }
  return (
    <div className='flex flex-none items-center gap-1.5'>
      <Swatch color='hsl(330 80% 56%)' />
      <Swatch color='hsl(330 22% 62%)' />
    </div>
  )
}

export default function HowItWorks() {
  return (
    <main className='min-h-svh bg-background'>
      <header className='flex items-center border-b border-border px-6 py-4 sm:px-8'>
        <Link href='/' className='flex items-center gap-2.5'>
          <span
            className='size-[11px] rounded-full'
            style={{ background: ACCENT }}
          />
          <span className='font-heading text-[20px] font-bold tracking-tight'>
            dress
          </span>
        </Link>
      </header>

      <section className='mx-auto max-w-[720px] px-6 pt-14 pb-10 text-center sm:px-8'>
        <div className='text-[12px] font-semibold tracking-[0.16em] text-muted-foreground uppercase'>
          The guide
        </div>
        <h1 className='font-heading mt-3 text-[40px] leading-[1.05] font-bold tracking-tight'>
          From a closet of photos to outfits that work
        </h1>
        <p className='mx-auto mt-4 max-w-[540px] text-[15.5px] leading-relaxed text-muted-foreground'>
          dress scores how well any two pieces go together, then helps you stack
          them into looks. Here’s everything it does — and how to get the most
          out of it.
        </p>
        <div
          className='mt-6 inline-flex items-baseline gap-2 rounded-2xl px-5 py-3 text-white shadow-md'
          style={{ background: ACCENT }}
        >
          <span className='font-heading text-[30px] leading-none font-extrabold'>
            28
          </span>
          <span className='text-sm opacity-80'>/ 36</span>
          <span className='ml-1 text-[13px] font-semibold'>In harmony</span>
        </div>
      </section>

      <div className='mx-auto grid max-w-[960px] gap-10 px-6 pb-16 sm:px-8 lg:grid-cols-[170px_minmax(0,1fr)] lg:gap-12'>
        <nav className='hidden lg:block'>
          <div className='sticky top-8'>
            <div className='mb-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase'>
              On this page
            </div>
            <ul className='flex flex-col gap-2'>
              {TOC.map(item => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className='text-[13.5px] text-muted-foreground hover:text-foreground'
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className='flex flex-col gap-14'>
          <section>
            <SectionHeading
              id='start'
              kicker='Step by step'
              title='Quick start'
              intro='Three moves and you have your first scored outfit.'
            />
            <ol className='mt-5 flex flex-col gap-3'>
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className='flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm'
                >
                  <span
                    className='font-heading flex size-8 flex-none items-center justify-center rounded-full text-[15px] font-bold text-white'
                    style={{ background: ACCENT }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className='font-heading text-[16px] font-bold'>
                      {step.title}
                    </h3>
                    <p className='mt-1 text-[13.5px] leading-snug text-muted-foreground'>
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <SectionHeading
              id='adding'
              kicker='Your wardrobe'
              title='Adding a piece'
              intro='You describe a few things; the rest we read from the color so the engine has something to reason about.'
            />
            <h3 className='font-heading mt-5 text-[15px] font-bold'>
              What you set
            </h3>
            <div className='mt-3 flex flex-col gap-2.5'>
              {SET_FIELDS.map(field => (
                <div
                  key={field.name}
                  className='rounded-xl border border-border bg-card p-4 shadow-sm'
                >
                  <div className='text-[13.5px] font-semibold'>
                    {field.name}
                  </div>
                  <p className='mt-1 text-[13px] leading-snug text-muted-foreground'>
                    {field.text}
                  </p>
                </div>
              ))}
            </div>

            <div
              className='mt-5 rounded-2xl border p-5'
              style={{ borderColor: `${ACCENT}55`, background: `${ACCENT}0f` }}
            >
              <h3 className='font-heading text-[15px] font-bold'>
                What we read for you
              </h3>
              <p className='mt-1.5 text-[13px] leading-relaxed text-muted-foreground'>
                You never set these — they’re derived from the color the moment
                you save.
              </p>
              <div className='mt-3 flex flex-col gap-2.5'>
                {AUTO_FIELDS.map(field => (
                  <div key={field.name}>
                    <div className='text-[13.5px] font-semibold'>
                      {field.name}
                    </div>
                    <p className='mt-0.5 text-[13px] leading-snug text-muted-foreground'>
                      {field.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <SectionHeading
              id='browse'
              kicker='Finding matches'
              title='Browsing your wardrobe'
              intro='Two ways to look at the same scored closet.'
            />
            <div className='mt-5 flex flex-col gap-3'>
              <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
                <h3 className='font-heading text-[15px] font-bold'>
                  Hover to preview
                </h3>
                <p className='mt-1 text-[13.5px] leading-snug text-muted-foreground'>
                  Point at any piece and its matches across the other slots light
                  up, each with a score badge. Nothing is added yet — it’s a
                  preview.
                </p>
              </div>
              <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
                <h3 className='font-heading text-[15px] font-bold'>
                  Circular & list views
                </h3>
                <p className='mt-1 text-[13.5px] leading-snug text-muted-foreground'>
                  The wheel lays your wardrobe out head-to-toe; the list is an
                  outfit carousel. Same scores, whichever you prefer.
                </p>
              </div>
              <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
                <h3 className='font-heading text-[15px] font-bold'>
                  Grayed-out pieces
                </h3>
                <p className='mt-1 text-[13.5px] leading-snug text-muted-foreground'>
                  A dimmed piece scores too low to recommend with your current
                  pick — but it’s never locked. Select it anyway if that’s the
                  look you want.
                </p>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading
              id='building'
              kicker='Putting it together'
              title='Building an outfit'
              intro='Tap pieces into the builder and it keeps the look honest as you go.'
            />
            <ul className='mt-5 flex flex-col gap-3'>
              <li className='rounded-2xl border border-border bg-card p-4 text-[13.5px] leading-snug text-muted-foreground shadow-sm'>
                <span className='font-semibold text-foreground'>Add pieces</span>{' '}
                — tapping adds them to the builder. Selection follows realistic
                slot rules (see Slots &amp; layering below).
              </li>
              <li className='rounded-2xl border border-border bg-card p-4 text-[13.5px] leading-snug text-muted-foreground shadow-sm'>
                <span className='font-semibold text-foreground'>
                  Watch the harmony
                </span>{' '}
                — with two or more pieces you get a harmony score: the average
                match across every pair in the look.
              </li>
              <li className='rounded-2xl border border-border bg-card p-4 text-[13.5px] leading-snug text-muted-foreground shadow-sm'>
                <span className='font-semibold text-foreground'>
                  Handle conflicts
                </span>{' '}
                — if two pieces don’t belong together you get a notice. Hit{' '}
                <span className='font-semibold text-foreground'>
                  Wear it anyway
                </span>{' '}
                to score it as-is, or swap one out.
              </li>
              <li className='rounded-2xl border border-border bg-card p-4 text-[13.5px] leading-snug text-muted-foreground shadow-sm'>
                <span className='font-semibold text-foreground'>Save it</span> —
                give it a name and it lands under Outfits, harmony and all.
              </li>
            </ul>
          </section>

          <section>
            <SectionHeading
              id='score'
              kicker='The math, plainly'
              title='The harmony score'
              intro='Every pair of pieces is scored out of 36 — higher means they sit together better. Six signals add up; the bar shows how much each can weigh.'
            />
            <div className='mt-5 flex flex-col gap-3'>
              {AXES.map(axis => (
                <div
                  key={axis.name}
                  className='rounded-2xl border border-border bg-card p-5 shadow-sm'
                >
                  <div className='flex items-baseline justify-between'>
                    <span className='font-heading text-[17px] font-bold'>
                      {axis.name}
                    </span>
                    <span className='font-heading text-[15px] font-bold text-muted-foreground'>
                      {axis.weight}
                      <span className='text-[12px] font-normal'> pts</span>
                    </span>
                  </div>
                  <div className='mt-3 h-2 overflow-hidden rounded-full bg-muted'>
                    <div
                      className='h-full rounded-full'
                      style={{
                        width: `${(axis.weight / MAX_AXIS) * 100}%`,
                        background: ACCENT,
                      }}
                    />
                  </div>
                  <p className='mt-3 text-[13.5px] leading-snug text-muted-foreground'>
                    {axis.text}
                  </p>
                </div>
              ))}
            </div>

            <h3 className='font-heading mt-7 text-[16px] font-bold'>
              Reading the number
            </h3>
            <p className='mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground'>
              We only suggest pairs that clear about 60% (22 of 36). Anything
              weaker stays out of the highlights — though you can still pick it
              by hand. An outfit’s harmony is the average across all its pairs.
            </p>
            <div className='mt-4 flex flex-col gap-2.5'>
              {TONES.map(tone => (
                <div
                  key={tone.band}
                  className='flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm'
                >
                  <span
                    className='size-3 flex-none rounded-full'
                    style={{ background: tone.color }}
                  />
                  <span className='font-heading w-[120px] flex-none text-[14px] font-bold'>
                    {tone.band}
                  </span>
                  <span className='w-[64px] flex-none text-[13px] font-semibold text-muted-foreground'>
                    {tone.range}
                  </span>
                  <span className='text-[13px] text-muted-foreground'>
                    {tone.text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading
              id='color'
              kicker='The 12-point axis'
              title='Color, in depth'
              intro='Color carries the most weight — up to 12 of the 36 points. Here is exactly what moves it.'
            />

            <div
              className='mt-5 rounded-2xl border p-5'
              style={{ borderColor: `${ACCENT}55`, background: `${ACCENT}0f` }}
            >
              <h3 className='font-heading text-[16px] font-bold'>
                Neutrals are the easy win
              </h3>
              <p className='mt-2 text-[13.5px] leading-relaxed text-muted-foreground'>
                Black, white, grey, cream and other near-greys (very low
                saturation) are treated as easy-going — they score high against
                almost any piece. Two neutrals together are nearly perfect, best
                when their lightness is close. A neutral next to a bright,
                saturated color scores even higher when there is a clear
                light-vs-dark contrast.
              </p>
              <div className='mt-4 flex flex-wrap items-center gap-x-5 gap-y-3'>
                <div className='flex items-center gap-1.5'>
                  {['#1a1815', '#4a4640', '#858481', '#b9b2a5', '#e7e2d6', '#fbfaf6'].map(
                    c => (
                      <Swatch key={c} color={c} />
                    )
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <Swatch color='#26303f' />
                  <span className='text-muted-foreground'>+</span>
                  <Swatch color='hsl(175 70% 45%)' />
                  <span className='text-[12px] text-muted-foreground'>
                    neutral + one pop
                  </span>
                </div>
              </div>
            </div>

            <h3 className='font-heading mt-7 text-[16px] font-bold'>
              Two real colors → the wheel
            </h3>
            <p className='mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground'>
              When neither piece is a neutral, we measure the angle between
              their hues on the color wheel.
            </p>
            <div className='mt-4 flex flex-col gap-2.5'>
              {COLOR_WHEEL.map(rel => (
                <div
                  key={rel.name}
                  className='flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm'
                >
                  <HueDial a={rel.a} b={rel.b} />
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                      <span className='font-heading text-[15px] font-bold'>
                        {rel.name}
                      </span>
                      <span className='rounded-md bg-muted px-2 py-0.5 text-[12px] text-muted-foreground'>
                        {rel.angle}
                      </span>
                      <span className='ml-auto text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase'>
                        {rel.verdict}
                      </span>
                    </div>
                    <p className='mt-1.5 text-[13px] leading-snug text-muted-foreground'>
                      {rel.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className='font-heading mt-7 text-[16px] font-bold'>
              Then three adjustments
            </h3>
            <p className='mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground'>
              On top of the wheel relationship, three smaller signals tune the
              score up or down.
            </p>
            <div className='mt-4 flex flex-col gap-2.5'>
              {COLOR_ADJUST.map(adjust => (
                <div
                  key={adjust.name}
                  className='flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm'
                >
                  <div className='min-w-0 flex-1'>
                    <div className='text-[13.5px] font-semibold'>
                      {adjust.name}
                    </div>
                    <p className='mt-1 text-[13px] leading-snug text-muted-foreground'>
                      {adjust.text}
                    </p>
                  </div>
                  <AdjustGraphic name={adjust.name} />
                </div>
              ))}
            </div>

            <p className='mt-5 text-[13.5px] leading-relaxed text-muted-foreground'>
              That is why a mostly-neutral wardrobe pairs with almost
              everything, and why two bright, saturated pieces rarely top the
              list — the engine reads them as competing rather than
              complementing.
            </p>
          </section>

          <section>
            <SectionHeading
              id='rules'
              kicker='Two kinds of no'
              title='Rules & overrides'
              intro='Some combinations are filtered out; others just earn a low score. The difference matters.'
            />

            <h3 className='font-heading mt-5 text-[16px] font-bold'>
              Structural conflicts — overridable
            </h3>
            <p className='mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground'>
              These aren’t about taste, they’re about what physically layers.
              They’re kept out of suggestions, but “Wear it anyway” lets you
              override them for a deliberate look.
            </p>
            <div className='mt-3 flex flex-col gap-3'>
              {STRUCTURAL_RULES.map(rule => (
                <div
                  key={rule.left}
                  className='flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-border bg-card p-4 shadow-sm'
                >
                  <span className='rounded-lg bg-muted px-2.5 py-1 text-[13px] font-semibold'>
                    {rule.left}
                  </span>
                  <span className='text-muted-foreground'>×</span>
                  <span className='rounded-lg bg-muted px-2.5 py-1 text-[13px] font-semibold'>
                    {rule.right}
                  </span>
                  <span className='text-[13.5px] text-muted-foreground'>
                    — {rule.text}
                  </span>
                </div>
              ))}
            </div>

            <div
              className='mt-5 rounded-2xl border p-5'
              style={{ borderColor: `${ACCENT}55`, background: `${ACCENT}0f` }}
            >
              <h3 className='font-heading text-[16px] font-bold'>
                Honest scoring — never faked
              </h3>
              <p className='mt-2 text-[13.5px] leading-relaxed text-muted-foreground'>
                Clashing colors, clashing vibes and two loud patterns are never
                blocked and never overridden. They simply earn a low number — a
                bad combo gets a small score, and we won’t pretend it looks good.
              </p>
            </div>
          </section>

          <section>
            <SectionHeading
              id='slots'
              kicker='How many at once'
              title='Slots & layering'
              intro='How many of each kind you can wear together — kept realistic, so two pairs of shoes or two pairs of jeans never happen.'
            />
            <div className='mt-5 flex flex-col gap-3'>
              {STACKING.map(rule => (
                <div
                  key={rule.label}
                  className='rounded-2xl border border-border bg-card p-4 shadow-sm'
                >
                  <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                    <span className='font-heading text-[15px] font-bold'>
                      {rule.label}
                    </span>
                    <span className='text-[12.5px] tracking-wide text-muted-foreground'>
                      {rule.items}
                    </span>
                  </div>
                  <p className='mt-1.5 text-[13.5px] leading-snug text-muted-foreground'>
                    {rule.text}
                  </p>
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
