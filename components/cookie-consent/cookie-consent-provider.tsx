"use client"

import { createContext, useCallback, useEffect, useState } from "react"
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_VERSION,
  type CookieConsent,
} from "@/lib/cookies"

interface CookieConsentContextType {
  consent: CookieConsent | null
  hasConsented: boolean
  showBanner: boolean
  updateConsent: (consent: Partial<CookieConsent>) => void
  acceptAll: () => void
  acceptNecessaryOnly: () => void
}

export const CookieConsentContext =
  createContext<CookieConsentContextType | null>(null)

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookieConsent
        setConsent(parsed)
      } catch {
        localStorage.removeItem(COOKIE_CONSENT_KEY)
      }
    }
  }, [])

  const saveConsent = useCallback((newConsent: CookieConsent) => {
    setConsent(newConsent)
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent))
  }, [])

  const updateConsent = useCallback(
    (partial: Partial<CookieConsent>) => {
      const newConsent: CookieConsent = {
        necessary: true,
        analytics: false,
        marketing: false,
        ...consent,
        ...partial,
        timestamp: new Date().toISOString(),
        version: COOKIE_CONSENT_VERSION,
      }
      saveConsent(newConsent)
    },
    [consent, saveConsent]
  )

  const acceptAll = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: COOKIE_CONSENT_VERSION,
    })
  }, [saveConsent])

  const acceptNecessaryOnly = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: COOKIE_CONSENT_VERSION,
    })
  }, [saveConsent])

  const hasConsented = consent !== null
  const showBanner = mounted && !hasConsented

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasConsented,
        showBanner,
        updateConsent,
        acceptAll,
        acceptNecessaryOnly,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}
