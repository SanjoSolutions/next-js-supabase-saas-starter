import { describe, expect, it } from "vitest"
import {
  calculateVat,
  calculateGross,
  calculatePlatformFee,
  calculateSellerPayout,
  calculatePriceBreakdown,
  formatEurCents,
} from "./price"

describe("price utilities", () => {
  describe("calculateVat", () => {
    it("calculates 19% VAT by default", () => {
      expect(calculateVat(10000)).toBe(1900)
    })

    it("calculates VAT with custom rate", () => {
      expect(calculateVat(10000, 7)).toBe(700)
    })

    it("rounds to nearest cent", () => {
      expect(calculateVat(333)).toBe(63) // 333 * 0.19 = 63.27 -> 63
    })

    it("returns 0 for 0 input", () => {
      expect(calculateVat(0)).toBe(0)
    })

    it("handles 0% VAT rate", () => {
      expect(calculateVat(10000, 0)).toBe(0)
    })
  })

  describe("calculateGross", () => {
    it("calculates gross with default 19% VAT", () => {
      expect(calculateGross(10000)).toBe(11900)
    })

    it("calculates gross with custom VAT rate", () => {
      expect(calculateGross(10000, 7)).toBe(10700)
    })

    it("returns 0 for 0 input", () => {
      expect(calculateGross(0)).toBe(0)
    })
  })

  describe("calculatePlatformFee", () => {
    it("calculates 10% fee by default", () => {
      expect(calculatePlatformFee(10000)).toBe(1000)
    })

    it("calculates fee with custom percent", () => {
      expect(calculatePlatformFee(10000, 15)).toBe(1500)
    })

    it("rounds to nearest cent", () => {
      expect(calculatePlatformFee(333)).toBe(33) // 333 * 0.10 = 33.3 -> 33
    })

    it("returns 0 for 0 input", () => {
      expect(calculatePlatformFee(0)).toBe(0)
    })
  })

  describe("calculateSellerPayout", () => {
    it("calculates payout as net minus platform fee", () => {
      expect(calculateSellerPayout(10000)).toBe(9000)
    })

    it("calculates payout with custom fee percent", () => {
      expect(calculateSellerPayout(10000, 15)).toBe(8500)
    })

    it("returns 0 for 0 input", () => {
      expect(calculateSellerPayout(0)).toBe(0)
    })
  })

  describe("calculatePriceBreakdown", () => {
    it("returns complete breakdown with defaults", () => {
      const result = calculatePriceBreakdown(10000)

      expect(result).toEqual({
        netCents: 10000,
        vatRate: 19,
        vatCents: 1900,
        grossCents: 11900,
        platformFeeCents: 1000,
        sellerPayoutCents: 9000,
      })
    })

    it("returns breakdown with custom rates", () => {
      const result = calculatePriceBreakdown(5000, 7, 15)

      expect(result).toEqual({
        netCents: 5000,
        vatRate: 7,
        vatCents: 350,
        grossCents: 5350,
        platformFeeCents: 750,
        sellerPayoutCents: 4250,
      })
    })

    it("handles small amounts", () => {
      const result = calculatePriceBreakdown(100)

      expect(result.netCents).toBe(100)
      expect(result.vatCents).toBe(19)
      expect(result.grossCents).toBe(119)
      expect(result.platformFeeCents).toBe(10)
      expect(result.sellerPayoutCents).toBe(90)
    })

    it("ensures net = sellerPayout + platformFee", () => {
      const result = calculatePriceBreakdown(7777)
      expect(result.sellerPayoutCents + result.platformFeeCents).toBe(result.netCents)
    })

    it("ensures gross = net + vat", () => {
      const result = calculatePriceBreakdown(7777)
      expect(result.netCents + result.vatCents).toBe(result.grossCents)
    })
  })

  describe("formatEurCents", () => {
    it("formats cents as EUR", () => {
      const result = formatEurCents(10000)
      expect(result).toContain("100")
      expect(result).toContain("€")
    })

    it("formats 0 cents", () => {
      const result = formatEurCents(0)
      expect(result).toContain("0")
      expect(result).toContain("€")
    })

    it("formats cents with decimals", () => {
      const result = formatEurCents(1050)
      expect(result).toContain("10")
      expect(result).toContain("50")
    })
  })
})
