"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useCookieConsent } from "./use-cookie-consent"
import { COOKIE_CATEGORIES, type CookieCategory } from "@/lib/cookies"

export function CookieConsentBanner() {
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
  })
  const { showBanner, acceptAll, acceptNecessaryOnly, updateConsent } =
    useCookieConsent()

  if (!showBanner) {
    return null
  }

  const handleSavePreferences = () => {
    updateConsent({
      necessary: true,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Cookie-Einstellungen</CardTitle>
          <CardDescription>
            Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf
            unserer Website zu bieten. Weitere Informationen finden Sie in
            unserer{" "}
            <Link href="/datenschutz" className="underline hover:no-underline">
              Datenschutzerklärung
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSettings && (
            <div className="space-y-3 border-t pt-4">
              {(
                Object.entries(COOKIE_CATEGORIES) as [
                  CookieCategory,
                  (typeof COOKIE_CATEGORIES)[CookieCategory],
                ][]
              ).map(([key, category]) => (
                <div key={key} className="flex items-start space-x-3">
                  <Checkbox
                    id={key}
                    checked={
                      category.required ? true : preferences[key as keyof typeof preferences] ?? false
                    }
                    disabled={category.required}
                    onCheckedChange={(checked) => {
                      if (!category.required) {
                        setPreferences((prev) => ({
                          ...prev,
                          [key]: checked === true,
                        }))
                      }
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                      {category.required && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Erforderlich)
                        </span>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={acceptAll}>Alle akzeptieren</Button>
            {showSettings ? (
              <Button variant="outline" onClick={handleSavePreferences}>
                Auswahl speichern
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
              >
                Einstellungen
              </Button>
            )}
            <Button variant="ghost" onClick={acceptNecessaryOnly}>
              Nur notwendige
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
