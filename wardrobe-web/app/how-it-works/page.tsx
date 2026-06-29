import Link from 'next/link'

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
    name: 'Season (weather)',
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
    text: 'Style vibes (casual, edgy, romantic…). Some pairs clash by a compatibility matrix.',
  },
  {
    name: 'Pattern',
    weight: 3,
    text: 'Solids mix with anything; two bold patterns together clash.',
  },
]

export default function HowItWorks() {
  return (
    <main className='mx-auto max-w-[760px] px-6 py-12 sm:px-8'>
      <Link
        href='/'
        className='text-[13px] font-medium text-muted-foreground hover:text-foreground'
      >
        ← Back
      </Link>

      <h1 className='font-heading mt-4 text-[32px] font-bold tracking-tight'>
        How matching works
      </h1>
      <p className='mt-3 text-[15px] leading-relaxed text-muted-foreground'>
        Every two pieces get a harmony score out of 36 — higher means they go
        together better. The wheel highlights strong matches; an outfit&apos;s
        harmony is the average across its pieces.
      </p>

      <h2 className='font-heading mt-9 text-xl font-bold'>What we look at</h2>
      <p className='mt-2 text-[14px] text-muted-foreground'>
        Six signals add up to the score (max contribution each):
      </p>
      <div className='mt-4 flex flex-col gap-3'>
        {AXES.map(axis => (
          <div
            key={axis.name}
            className='flex gap-4 rounded-xl border border-border bg-card p-4'
          >
            <div className='flex-none'>
              <div className='font-heading text-2xl font-bold leading-none'>
                {axis.weight}
              </div>
              <div className='mt-0.5 text-[10px] tracking-wide text-muted-foreground uppercase'>
                max
              </div>
            </div>
            <div>
              <div className='text-[15px] font-semibold'>{axis.name}</div>
              <div className='mt-0.5 text-[13.5px] leading-snug text-muted-foreground'>
                {axis.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className='font-heading mt-9 text-xl font-bold'>
        Rules you can break
      </h2>
      <p className='mt-2 text-[14px] leading-relaxed text-muted-foreground'>
        Some pairings are about <strong>what</strong> you wear together, not
        taste — so they&apos;re kept out of suggestions, but you can override
        them with <em>“Wear it anyway”</em> for a deliberate look:
      </p>
      <ul className='mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[14px] text-foreground'>
        <li>
          A <strong>dress</strong> is a full look — it doesn&apos;t pair with a
          top, bottom or skirt.
        </li>
        <li>
          <strong>Pants and a skirt</strong> can&apos;t go together (same slot).
        </li>
        <li>
          <strong>Opposite weather</strong> — a summer-only piece with a
          winter-only piece.
        </li>
      </ul>

      <h2 className='font-heading mt-9 text-xl font-bold'>
        Rules we don&apos;t fake
      </h2>
      <p className='mt-2 text-[14px] leading-relaxed text-muted-foreground'>
        Color, vibe and pattern are never blocked and never overridden — they
        just score honestly. A clashing-color combo simply gets a low number;
        we won&apos;t pretend it looks good.
      </p>

      <Link
        href='/'
        className='mt-10 inline-block text-[13px] font-medium text-muted-foreground hover:text-foreground'
      >
        ← Back to wardrobe
      </Link>
    </main>
  )
}
