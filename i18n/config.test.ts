import { describe, it, expect } from "vitest"
import { locales, defaultLocale, localeNames, type Locale } from "./config"

describe("i18n config", () => {
  it("should have en and de locales", () => {
    expect(locales).toContain("en")
    expect(locales).toContain("de")
    expect(locales).toHaveLength(2)
  })

  it("should have de as default locale", () => {
    expect(defaultLocale).toBe("de")
  })

  it("should have locale names for all locales", () => {
    expect(localeNames.en).toBe("English")
    expect(localeNames.de).toBe("Deutsch")
  })

  it("should have type-safe locale type", () => {
    const testLocale: Locale = "en"
    expect(locales.includes(testLocale)).toBe(true)
  })
})
