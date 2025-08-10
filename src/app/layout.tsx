import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AnalyticsProvider } from '../components/AnalyticsProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PhotonPong',
  description: 'Modern Pong game',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnalyticsProvider />
        <header className="border-b p-4">
          <nav className="flex gap-4">
            <Link href="/">Home</Link>
            <Link href="/leaderboard">Leaderboard</Link>
          </nav>
        </header>
        {children}
        <Script id="sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js')
            }
          `}
        </Script>
      </body>
    </html>
  )
}
