import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PriceDisplay } from "./price-display"

describe("PriceDisplay", () => {
  it("renders full breakdown by default", () => {
    render(
      <I18nTestWrapper locale="en">
        <PriceDisplay netCents={10000} />
      </I18nTestWrapper>
    )

    // Net price
    expect(screen.getByText(/Net/)).toBeInTheDocument()
    // VAT line
    expect(screen.getByText(/VAT/)).toBeInTheDocument()
    // Gross line
    expect(screen.getByText(/Gross/)).toBeInTheDocument()
  })

  it("renders only gross when showBreakdown is false", () => {
    render(
      <I18nTestWrapper locale="en">
        <PriceDisplay netCents={10000} showBreakdown={false} />
      </I18nTestWrapper>
    )

    // Should not show net/vat labels
    expect(screen.queryByText(/Net/)).not.toBeInTheDocument()
    // Should show the gross amount
    const status = screen.getByRole("status")
    expect(status).toBeInTheDocument()
  })

  it("has role=status for accessibility", () => {
    render(
      <I18nTestWrapper locale="en">
        <PriceDisplay netCents={5000} />
      </I18nTestWrapper>
    )

    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("uses custom VAT rate", () => {
    render(
      <I18nTestWrapper locale="en">
        <PriceDisplay netCents={10000} vatRate={7} />
      </I18nTestWrapper>
    )

    // Should mention 7% somewhere in the VAT line
    expect(screen.getByText(/7%/)).toBeInTheDocument()
  })

  it("renders in German locale", () => {
    render(
      <I18nTestWrapper locale="de">
        <PriceDisplay netCents={10000} />
      </I18nTestWrapper>
    )

    expect(screen.getByText(/Netto/)).toBeInTheDocument()
    expect(screen.getByText(/MwSt/)).toBeInTheDocument()
    expect(screen.getByText(/Brutto/)).toBeInTheDocument()
  })
})
