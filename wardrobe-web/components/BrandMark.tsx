import Link from 'next/link'
import { BRAND_ACCENT } from '@/lib/theme'

export function BrandMark({ size = 23 }: { size?: number }) {
  return (
    <Link href='/' className='flex flex-none items-center gap-2.5'>
      <span
        className='size-[11px] rounded-full'
        style={{ background: BRAND_ACCENT }}
      />
      <span
        className='font-heading font-bold tracking-tight'
        style={{ fontSize: size }}
      >
        dress
      </span>
    </Link>
  )
}
