"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
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
import { useTranslations } from "next-intl"

export function CookieConsentBanner() {
  const t = useTranslations("cookies")
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

  const categoryKeys = Object.keys(COOKIE_CATEGORIES) as CookieCategory[]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <CardDescription>
            {t("description")}{" "}
            <Link href="/privacy-policy" className="underline hover:no-underline">
              {t("privacyPolicy")}
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSettings && (
            <div className="space-y-3 border-t pt-4">
              {categoryKeys.map((key) => {
                const category = COOKIE_CATEGORIES[key]
                return (
                  <div key={key} className="flex items-start space-x-3">
                    <Checkbox
                      id={key}
                      checked={
                        category.required
                          ? true
                          : (preferences[
                              key as keyof typeof preferences
                            ] ?? false)
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
                        {t(`categories.${key}.name`)}
                        {category.required && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {t("required")}
                          </span>
                        )}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t(`categories.${key}.description`)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={acceptAll}>{t("acceptAll")}</Button>
            {showSettings ? (
              <Button variant="outline" onClick={handleSavePreferences}>
                {t("savePreferences")}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setShowSettings(true)}>
                {t("settings")}
              </Button>
            )}
            <Button variant="ghost" onClick={acceptNecessaryOnly}>
              {t("necessaryOnly")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
