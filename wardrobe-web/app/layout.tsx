import type { Metadata } from 'next'
import { Geist_Mono, Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Package from '@/package.json'
import { cn } from '@/lib/utils'

const interHeading = Inter({ subsets: ['latin'], variable: '--font-heading' })
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] })

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
        geistMono.variable,
        inter.variable,
        interHeading.variable
      )}
    >
      <body>
        <Providers>
          <div className='isolate relative flex min-h-svh flex-col"'>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
