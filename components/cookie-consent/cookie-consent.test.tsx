import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CookieConsentBanner } from "./cookie-consent-banner"
import { CookieConsentProvider } from "./cookie-consent-provider"
import { useCookieConsent } from "./use-cookie-consent"

// Helper component to test the hook
function TestConsumer() {
  const { consent, hasConsented, showBanner, acceptAll, acceptNecessaryOnly } =
    useCookieConsent()
  return (
    <div>
      <span data-testid="has-consented">{hasConsented.toString()}</span>
      <span data-testid="show-banner">{showBanner.toString()}</span>
      <span data-testid="consent">
        {consent ? JSON.stringify(consent) : "null"}
      </span>
      <button onClick={acceptAll}>Accept All</button>
      <button onClick={acceptNecessaryOnly}>Necessary Only</button>
    </div>
  )
}

describe("CookieConsentProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it("returns hasConsented false when no consent stored", async () => {
    render(
      <CookieConsentProvider>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("has-consented")).toHaveTextContent("false")
    })
  })

  it("returns hasConsented true when consent is stored", async () => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: false,
        timestamp: new Date().toISOString(),
        version: "1.0",
      })
    )

    render(
      <CookieConsentProvider>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("has-consented")).toHaveTextContent("true")
    })
  })

  it("acceptAll sets all categories to true", async () => {
    const user = userEvent.setup()

    render(
      <CookieConsentProvider>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("show-banner")).toHaveTextContent("true")
    })

    await user.click(screen.getByRole("button", { name: "Accept All" }))

    await waitFor(() => {
      const consent = JSON.parse(screen.getByTestId("consent").textContent!)
      expect(consent.necessary).toBe(true)
      expect(consent.analytics).toBe(true)
      expect(consent.marketing).toBe(true)
    })

    // Check localStorage was updated
    const stored = JSON.parse(localStorage.getItem("cookie-consent")!)
    expect(stored.analytics).toBe(true)
    expect(stored.marketing).toBe(true)
  })

  it("acceptNecessaryOnly sets optional categories to false", async () => {
    const user = userEvent.setup()

    render(
      <CookieConsentProvider>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("show-banner")).toHaveTextContent("true")
    })

    await user.click(screen.getByRole("button", { name: "Necessary Only" }))

    await waitFor(() => {
      const consent = JSON.parse(screen.getByTestId("consent").textContent!)
      expect(consent.necessary).toBe(true)
      expect(consent.analytics).toBe(false)
      expect(consent.marketing).toBe(false)
    })
  })

  it("stores timestamp and version in consent", async () => {
    const user = userEvent.setup()

    render(
      <CookieConsentProvider>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("show-banner")).toHaveTextContent("true")
    })

    await user.click(screen.getByRole("button", { name: "Accept All" }))

    await waitFor(() => {
      const consent = JSON.parse(screen.getByTestId("consent").textContent!)
      expect(consent.timestamp).toBeDefined()
      expect(consent.version).toBe("1.0")
    })
  })

  it("handles invalid localStorage data gracefully", async () => {
    localStorage.setItem("cookie-consent", "invalid-json")

    render(
      <CookieConsentProvider>
        <TestConsumer />
      </CookieConsentProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("has-consented")).toHaveTextContent("false")
    })

    // Invalid data should be cleared
    expect(localStorage.getItem("cookie-consent")).toBeNull()
  })
})

describe("CookieConsentBanner", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders banner when no consent given", async () => {
    render(
      <CookieConsentProvider>
        <CookieConsentBanner />
      </CookieConsentProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("Cookie-Einstellungen")).toBeInTheDocument()
    })
  })

  it("does not render when consent already given", async () => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: false,
        timestamp: new Date().toISOString(),
        version: "1.0",
      })
    )

    render(
      <CookieConsentProvider>
        <CookieConsentBanner />
      </CookieConsentProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText("Cookie-Einstellungen")).not.toBeInTheDocument()
    })
  })

  it("hides banner after clicking Alle akzeptieren", async () => {
    const user = userEvent.setup()

    render(
      <CookieConsentProvider>
        <CookieConsentBanner />
      </CookieConsentProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("Cookie-Einstellungen")).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Alle akzeptieren" }))

    await waitFor(() => {
      expect(screen.queryByText("Cookie-Einstellungen")).not.toBeInTheDocument()
    })
  })

  it("shows settings panel when clicking Einstellungen", async () => {
    const user = userEvent.setup()

    render(
      <CookieConsentProvider>
        <CookieConsentBanner />
      </CookieConsentProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("Cookie-Einstellungen")).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Einstellungen" }))

    await waitFor(() => {
      expect(screen.getByText("Notwendig")).toBeInTheDocument()
      expect(screen.getByText("Analyse")).toBeInTheDocument()
      expect(screen.getByText("Marketing")).toBeInTheDocument()
      expect(screen.getByText("Auswahl speichern")).toBeInTheDocument()
    })
  })

  it("saves custom preferences when clicking Auswahl speichern", async () => {
    const user = userEvent.setup()

    render(
      <CookieConsentProvider>
        <CookieConsentBanner />
      </CookieConsentProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("Cookie-Einstellungen")).toBeInTheDocument()
    })

    // Open settings
    await user.click(screen.getByRole("button", { name: "Einstellungen" }))

    // Check analytics checkbox
    const analyticsCheckbox = screen.getByRole("checkbox", { name: /Analyse/ })
    await user.click(analyticsCheckbox)

    // Save
    await user.click(screen.getByRole("button", { name: "Auswahl speichern" }))

    await waitFor(() => {
      expect(screen.queryByText("Cookie-Einstellungen")).not.toBeInTheDocument()
    })

    const stored = JSON.parse(localStorage.getItem("cookie-consent")!)
    expect(stored.analytics).toBe(true)
    expect(stored.marketing).toBe(false)
  })

  it("contains link to privacy policy", async () => {
    render(
      <CookieConsentProvider>
        <CookieConsentBanner />
      </CookieConsentProvider>
    )

    await waitFor(() => {
      const link = screen.getByRole("link", { name: "Datenschutzerklärung" })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute("href", "/datenschutz")
    })
  })
})

describe("useCookieConsent", () => {
  it("throws error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    expect(() => {
      render(<TestConsumer />)
    }).toThrow("useCookieConsent must be used within a CookieConsentProvider")

    consoleSpy.mockRestore()
  })
})
