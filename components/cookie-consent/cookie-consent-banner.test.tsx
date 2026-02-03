import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { CookieConsentBanner } from "./cookie-consent-banner"
import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"

// Mock the useCookieConsent hook
const mockUseCookieConsent = vi.fn()
vi.mock("./use-cookie-consent", () => ({
  useCookieConsent: () => mockUseCookieConsent(),
}))

// Mock next-intl navigation Link
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe("CookieConsentBanner", () => {
  beforeEach(() => {
    mockUseCookieConsent.mockReset()
  })

  it("should not render when showBanner is false", () => {
    mockUseCookieConsent.mockReturnValue({
      showBanner: false,
      acceptAll: vi.fn(),
      acceptNecessaryOnly: vi.fn(),
      updateConsent: vi.fn(),
    })

    const { container } = render(
      <I18nTestWrapper locale="en">
        <CookieConsentBanner />
      </I18nTestWrapper>
    )

    expect(container.firstChild).toBeNull()
  })

  it("should render banner with English text when locale is en", () => {
    mockUseCookieConsent.mockReturnValue({
      showBanner: true,
      acceptAll: vi.fn(),
      acceptNecessaryOnly: vi.fn(),
      updateConsent: vi.fn(),
    })

    render(
      <I18nTestWrapper locale="en">
        <CookieConsentBanner />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Cookie Settings")).toBeInTheDocument()
    expect(screen.getByText("Accept all")).toBeInTheDocument()
    expect(screen.getByText("Settings")).toBeInTheDocument()
    expect(screen.getByText("Necessary only")).toBeInTheDocument()
  })

  it("should render banner with German text when locale is de", () => {
    mockUseCookieConsent.mockReturnValue({
      showBanner: true,
      acceptAll: vi.fn(),
      acceptNecessaryOnly: vi.fn(),
      updateConsent: vi.fn(),
    })

    render(
      <I18nTestWrapper locale="de">
        <CookieConsentBanner />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Cookie-Einstellungen")).toBeInTheDocument()
    expect(screen.getByText("Alle akzeptieren")).toBeInTheDocument()
    expect(screen.getByText("Einstellungen")).toBeInTheDocument()
    expect(screen.getByText("Nur notwendige")).toBeInTheDocument()
  })

  it("should have a link to privacy policy", () => {
    mockUseCookieConsent.mockReturnValue({
      showBanner: true,
      acceptAll: vi.fn(),
      acceptNecessaryOnly: vi.fn(),
      updateConsent: vi.fn(),
    })

    render(
      <I18nTestWrapper locale="en">
        <CookieConsentBanner />
      </I18nTestWrapper>
    )

    const privacyLink = screen.getByText("Privacy Policy")
    expect(privacyLink).toHaveAttribute("href", "/privacy-policy")
  })
})
