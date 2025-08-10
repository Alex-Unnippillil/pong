import type { Metadata } from 'next'
import Script from 'next/script'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AnalyticsProvider } from '../components/AnalyticsProvider'
import { I18nProvider } from '../components/I18nProvider'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import i18n from '../i18n'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: i18n.t('title'),
  description: i18n.t('description'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={i18n.language}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
          <AnalyticsProvider />
          <LanguageSwitcher />
          {children}
        </I18nProvider>
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
