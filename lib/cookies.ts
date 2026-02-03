export const COOKIE_CONSENT_KEY = "cookie-consent"
export const COOKIE_CONSENT_VERSION = "1.0"

export interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  timestamp: string
  version: string
}

export const COOKIE_CATEGORIES = {
  necessary: {
    required: true,
  },
  analytics: {
    required: false,
  },
  marketing: {
    required: false,
  },
} as const

export type CookieCategory = keyof typeof COOKIE_CATEGORIES
