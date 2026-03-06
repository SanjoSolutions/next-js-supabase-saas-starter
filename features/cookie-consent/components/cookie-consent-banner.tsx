"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
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
import { Link } from "@/i18n/navigation"
import {
  COOKIE_CATEGORIES,
  type CookieCategory,
} from "@/features/cookie-consent/lib/cookies"
import { useCookieConsent } from "./use-cookie-consent"

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
    <div
      data-testid="cookie-consent-banner"
      className="fixed inset-x-4 bottom-4 z-50 md:inset-x-auto md:right-4 md:w-[28rem] lg:right-6 lg:bottom-6"
    >
      <Card className="ml-auto border shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/95">
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
        <CardContent className="max-h-[min(32rem,calc(100vh-10rem))] space-y-4 overflow-y-auto">
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
