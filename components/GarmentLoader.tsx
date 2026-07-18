import { BRAND_ACCENT } from '@/lib/theme'

const TEE =
  'M35,16 C39,20 46,22 50,22 C54,22 61,20 65,16 L86,27 L79,45 L70,40 L70,86 C70,88.2 68.2,90 66,90 L34,90 C31.8,90 30,88.2 30,86 L30,40 L21,45 L14,27 Z'

export function GarmentLoader({
  size = 78,
  label,
}: {
  size?: number
  label?: string
}) {
  return (
    <div
      className='flex flex-col items-center gap-4'
      role='status'
      aria-label={label ?? 'Loading'}
    >
      <style>{`@keyframes tee-fill{0%,100%{transform:scaleY(.12)}50%{transform:scaleY(1)}}`}</style>
      <svg
        width={size}
        height={size}
        viewBox='4 8 92 90'
        fill='none'
        aria-hidden='true'
      >
        <defs>
          <clipPath id='garment-tee'>
            <path d={TEE} />
          </clipPath>
        </defs>
        <path
          d={TEE}
          fill='var(--muted)'
          stroke='var(--border)'
          strokeWidth={2.5}
          strokeLinejoin='round'
        />
        <g clipPath='url(#garment-tee)'>
          <rect
            x='0'
            y='16'
            width='100'
            height='74'
            fill={BRAND_ACCENT}
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'bottom',
              animation: 'tee-fill 1.5s ease-in-out infinite',
            }}
          />
        </g>
        <path
          d={TEE}
          fill='none'
          stroke='var(--border)'
          strokeWidth={2.5}
          strokeLinejoin='round'
        />
      </svg>
      {label && (
        <div className='text-[13px] font-medium text-muted-foreground'>
          {label}
        </div>
      )}
    </div>
  )
}
