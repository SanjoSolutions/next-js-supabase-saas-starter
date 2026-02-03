import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LanguageSwitcher } from "./language-switcher"
import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/en/test-path",
}))

// Mock next-intl navigation
const mockReplace = vi.fn()
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    mockReplace.mockClear()
  })

  it("should render current locale name", () => {
    render(
      <I18nTestWrapper locale="en">
        <LanguageSwitcher />
      </I18nTestWrapper>
    )

    expect(screen.getByText("English")).toBeInTheDocument()
  })

  it("should render current locale name in German", () => {
    render(
      <I18nTestWrapper locale="de">
        <LanguageSwitcher />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Deutsch")).toBeInTheDocument()
  })

  it("should show dropdown with locale options when clicked", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <LanguageSwitcher />
      </I18nTestWrapper>
    )

    const button = screen.getByRole("button")
    await user.click(button)

    expect(screen.getByRole("menuitemradio", { name: "English" })).toBeInTheDocument()
    expect(screen.getByRole("menuitemradio", { name: "Deutsch" })).toBeInTheDocument()
  })

  it("should call router.replace with new locale when selecting different language", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <LanguageSwitcher />
      </I18nTestWrapper>
    )

    const button = screen.getByRole("button")
    await user.click(button)

    const germanOption = screen.getByRole("menuitemradio", { name: "Deutsch" })
    await user.click(germanOption)

    expect(mockReplace).toHaveBeenCalledWith("/test-path", { locale: "de" })
  })

  it("should display correct locale based on URL path, not previous state", () => {
    // This test verifies that when the URL contains /en, the switcher shows "English"
    // and when URL contains /de, it shows "Deutsch"
    // The locale should be derived from the provider context which is set from the URL

    // When on English page
    const { rerender } = render(
      <I18nTestWrapper locale="en">
        <LanguageSwitcher />
      </I18nTestWrapper>
    )
    expect(screen.getByText("English")).toBeInTheDocument()

    // When navigating to German page (simulated by re-rendering with de locale)
    rerender(
      <I18nTestWrapper locale="de">
        <LanguageSwitcher />
      </I18nTestWrapper>
    )
    expect(screen.getByText("Deutsch")).toBeInTheDocument()
  })
})
