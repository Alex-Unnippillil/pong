'use client'

import { createNavigation } from 'next-intl/navigation'
import { useLocale } from 'next-intl'
import { locales } from '../i18n'

const { usePathname, useRouter } = createNavigation()

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  return (
    <div className="flex gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => router.replace(pathname, { locale: loc })}
          className={loc === locale ? 'font-bold underline' : ''}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
