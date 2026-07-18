import type { Metadata } from 'next'
import {
  Bricolage_Grotesque,
  Hanken_Grotesk,
  JetBrains_Mono,
} from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Package from '@/package.json'
import { cn } from '@/lib/utils'

const heading = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-heading',
})
const sans = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: Package.name,
  description: 'mock description',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      className={cn(
        'h-full',
        'antialiased',
        'font-sans',
        mono.variable,
        sans.variable,
        heading.variable
      )}
    >
      <body>
        <Providers>
          <div className='isolate relative flex min-h-svh flex-col'>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
