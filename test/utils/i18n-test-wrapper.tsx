import { NextIntlClientProvider } from "next-intl"
import { type ReactNode } from "react"
import enMessages from "@/messages/en.json"
import deMessages from "@/messages/de.json"

const messages = {
  en: enMessages,
  de: deMessages,
}

interface I18nTestWrapperProps {
  children: ReactNode
  locale?: "en" | "de"
}

export function I18nTestWrapper({
  children,
  locale = "en",
}: I18nTestWrapperProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  )
}
