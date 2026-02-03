import {
  formatDistanceToNow as fnsFormatDistanceToNow,
  format as fnsFormat,
} from "date-fns"
import { de, enUS } from "date-fns/locale"
import { type Locale } from "@/i18n/config"

const localeMap = {
  en: enUS,
  de: de,
}

export function formatDistanceToNow(
  date: Date | string,
  locale: Locale,
  options?: { addSuffix?: boolean }
) {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return fnsFormatDistanceToNow(dateObj, {
    ...options,
    locale: localeMap[locale],
  })
}

export function formatDate(
  date: Date | string,
  locale: Locale,
  formatStr: string = "PPP"
) {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return fnsFormat(dateObj, formatStr, {
    locale: localeMap[locale],
  })
}

export function getDateFnsLocale(locale: Locale) {
  return localeMap[locale]
}
