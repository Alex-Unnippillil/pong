import type { Metadata } from 'next'
import Script from 'next/script'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AnalyticsProvider } from '../components/AnalyticsProvider'
import { AuthButtons } from '../components/AuthButtons'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { MuteButton } from '../components/MuteButton'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale, getTranslations } from 'next-intl/server'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AnalyticsProvider />
          <header className="flex items-center justify-between gap-2 p-4">
            <AuthButtons />
            <LanguageSwitcher />
            <MuteButton />
          </header>
          {children}
        </NextIntlClientProvider>
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
