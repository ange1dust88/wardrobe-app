import Link from 'next/link'

const ACCENT = '#3d5a3d'
const MAX_AXIS = 12

const AXES = [
  {
    name: 'Color',
    weight: 12,
    text: 'How the colors sit together — neutrals are easy, complementary or analogous hues work, clashing temperatures and two loud colors hurt.',
  },
  {
    name: 'Role',
    weight: 6,
    text: 'Each piece is a core / tonal / pop. A calm base with one statement reads best; two statement pieces fight.',
  },
  {
    name: 'Season',
    weight: 5,
    text: 'How much the “when to wear” seasons overlap — pieces meant for the same weather pair better.',
  },
  {
    name: 'Palette',
    weight: 5,
    text: 'Seasonal color type (spring / summer / autumn / winter). Your color type from onboarding nudges this.',
  },
  {
    name: 'Vibe',
    weight: 5,
    text: 'Style vibes — casual, edgy, romantic… some pairs clash by a compatibility matrix.',
  },
  {
    name: 'Pattern',
    weight: 3,
    text: 'Solids mix with anything; two bold patterns together clash.',
  },
]

const RULES = [
  {
    left: 'dress',
    right: 'top · bottom',
    text: 'A dress is a full look on its own.',
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
    label: 'Layer by type',
    items: 'top · outerwear · bottom',
    text: 'Stack different types — a tee under a sweater, leggings under a skirt — but only one of each type.',
  },
  {
    label: 'As many as you like',
    items: 'bag · jewelry · accessory',
    text: 'Pile on freely — no limit.',
  },
]

export default function HowItWorks() {
  return (
    <main className='min-h-svh bg-background'>
      <header className='flex items-center border-b border-border px-6 py-4 sm:px-8'>
        <Link href='/' className='flex items-center gap-2.5'>
          <span className='size-[11px] rounded-full' style={{ background: ACCENT }} />
          <span className='font-heading text-[20px] font-bold tracking-tight'>
            dress
          </span>
        </Link>
      </header>

      <section className='mx-auto max-w-[720px] px-6 pt-14 pb-8 text-center sm:px-8'>
        <div className='text-[12px] font-semibold tracking-[0.16em] text-muted-foreground uppercase'>
          How it works
        </div>
        <h1 className='font-heading mt-3 text-[40px] leading-[1.05] font-bold tracking-tight'>
          Every pairing gets a harmony score
        </h1>
        <p className='mx-auto mt-4 max-w-[520px] text-[15.5px] leading-relaxed text-muted-foreground'>
          Two pieces are scored out of 36 — higher means they go together
          better. The wheel highlights strong matches, and an outfit&apos;s
          harmony is the average across its pieces.
        </p>
        <div className='mt-6 inline-flex items-baseline gap-2 rounded-2xl px-5 py-3 text-white shadow-md' style={{ background: ACCENT }}>
          <span className='font-heading text-[30px] leading-none font-extrabold'>
            28
          </span>
          <span className='text-sm opacity-80'>/ 36</span>
          <span className='ml-1 text-[13px] font-semibold'>In harmony</span>
        </div>
      </section>

      <section className='mx-auto max-w-[720px] px-6 pb-12 sm:px-8'>
        <h2 className='font-heading text-[22px] font-bold tracking-tight'>
          What we look at
        </h2>
        <p className='mt-1.5 text-[14px] text-muted-foreground'>
          Six signals add up to the score — bar shows how much each can weigh.
        </p>
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
      </section>

      <section className='mx-auto max-w-[720px] px-6 pb-12 sm:px-8'>
        <h2 className='font-heading text-[22px] font-bold tracking-tight'>
          Rules you can break
        </h2>
        <p className='mt-1.5 text-[14px] leading-relaxed text-muted-foreground'>
          These are about what you wear together, not taste — kept out of
          suggestions, but you can override them with “Wear it anyway” for a
          deliberate look.
        </p>
        <div className='mt-5 flex flex-col gap-3'>
          {RULES.map(rule => (
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
      </section>

      <section className='mx-auto max-w-[720px] px-6 pb-12 sm:px-8'>
        <h2 className='font-heading text-[22px] font-bold tracking-tight'>
          Slots &amp; layering
        </h2>
        <p className='mt-1.5 text-[14px] leading-relaxed text-muted-foreground'>
          How many of each kind you can wear at once — kept realistic, so two
          pairs of shoes or two pairs of jeans never happen.
        </p>
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
      </section>

      <section className='mx-auto max-w-[720px] px-6 pb-16 sm:px-8'>
        <div
          className='rounded-2xl border p-5'
          style={{ borderColor: `${ACCENT}55`, background: `${ACCENT}0f` }}
        >
          <h2 className='font-heading text-[18px] font-bold tracking-tight'>
            Rules we don&apos;t fake
          </h2>
          <p className='mt-2 text-[14px] leading-relaxed text-muted-foreground'>
            Color, vibe and pattern are never blocked and never overridden —
            they just score honestly. A clashing-color combo simply gets a low
            number; we won&apos;t pretend it looks good.
          </p>
        </div>

        <Link
          href='/'
          className='mt-10 inline-block text-[13px] font-medium text-muted-foreground hover:text-foreground'
        >
          ← Back to wardrobe
        </Link>
      </section>
    </main>
  )
}
