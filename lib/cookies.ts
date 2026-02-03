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
    name: "Notwendig",
    description:
      "Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.",
    required: true,
  },
  analytics: {
    name: "Analyse",
    description:
      "Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren.",
    required: false,
  },
  marketing: {
    name: "Marketing",
    description:
      "Diese Cookies werden verwendet, um Werbung relevanter für Sie zu gestalten.",
    required: false,
  },
} as const

export type CookieCategory = keyof typeof COOKIE_CATEGORIES
