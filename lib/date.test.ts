import { describe, it, expect } from "vitest"
import { formatDistanceToNow, formatDate, getDateFnsLocale } from "./date"
import { de, enUS } from "date-fns/locale"

describe("date utilities", () => {
  describe("formatDistanceToNow", () => {
    it("should format date in English", () => {
      const date = new Date()
      date.setMinutes(date.getMinutes() - 5)
      const result = formatDistanceToNow(date, "en", { addSuffix: true })
      expect(result).toContain("minutes")
      expect(result).toContain("ago")
    })

    it("should format date in German", () => {
      const date = new Date()
      date.setMinutes(date.getMinutes() - 5)
      const result = formatDistanceToNow(date, "de", { addSuffix: true })
      expect(result).toContain("Minuten")
    })

    it("should accept string date", () => {
      const dateStr = new Date().toISOString()
      const result = formatDistanceToNow(dateStr, "en")
      expect(typeof result).toBe("string")
    })
  })

  describe("formatDate", () => {
    it("should format date with default format", () => {
      const date = new Date("2024-01-15")
      const result = formatDate(date, "en")
      expect(result).toContain("January")
      expect(result).toContain("15")
    })

    it("should format date in German", () => {
      const date = new Date("2024-01-15")
      const result = formatDate(date, "de")
      expect(result).toContain("Januar")
      expect(result).toContain("15")
    })

    it("should accept custom format", () => {
      const date = new Date("2024-01-15")
      const result = formatDate(date, "en", "yyyy-MM-dd")
      expect(result).toBe("2024-01-15")
    })
  })

  describe("getDateFnsLocale", () => {
    it("should return English locale for en", () => {
      expect(getDateFnsLocale("en")).toBe(enUS)
    })

    it("should return German locale for de", () => {
      expect(getDateFnsLocale("de")).toBe(de)
    })
  })
})
