import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { OrgSwitcher } from "./org-switcher"

// Mock setActiveOrganizationAction
const mockSetActiveOrg = vi.fn()
vi.mock("@/app/[locale]/(authenticated)/organizations/actions", () => ({
  setActiveOrganizationAction: (...args: unknown[]) => mockSetActiveOrg(...args),
}))

// Mock Next.js router
const mockRefresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

describe("OrgSwitcher", () => {
  const mockOrganizations = [
    { id: "org-1", name: "Acme Corp" },
    { id: "org-2", name: "Globex Inc" },
    { id: "org-3", name: "Initech" },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockSetActiveOrg.mockResolvedValue(undefined)
  })

  it("renders the trigger button with active organization name", () => {
    render(
      <I18nTestWrapper locale="en">
        <OrgSwitcher organizations={mockOrganizations} activeOrgId="org-1" />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Acme Corp")).toBeInTheDocument()
  })

  it("shows 'Select Organization' when no active org", () => {
    render(
      <I18nTestWrapper locale="en">
        <OrgSwitcher organizations={mockOrganizations} />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Select Organization")).toBeInTheDocument()
  })

  it("opens dropdown menu when clicked", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <OrgSwitcher organizations={mockOrganizations} activeOrgId="org-1" />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Organizations")).toBeInTheDocument()
      expect(screen.getByText("Globex Inc")).toBeInTheDocument()
      expect(screen.getByText("Initech")).toBeInTheDocument()
    })
  })

  it("shows check mark next to active organization", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <OrgSwitcher organizations={mockOrganizations} activeOrgId="org-2" />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      // Find the menu item for Globex Inc (not the button trigger)
      const menuItems = screen.getAllByRole("menuitem")
      const globexItem = menuItems.find((item) =>
        item.textContent?.includes("Globex Inc")
      )
      expect(globexItem).toBeInTheDocument()
      // Check that the check icon is in the Globex item
      const checkIcon = globexItem?.querySelector("svg")
      expect(checkIcon).toBeInTheDocument()
    })
  })

  it("switches organization when clicking a different org", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <OrgSwitcher organizations={mockOrganizations} activeOrgId="org-1" />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Globex Inc")).toBeInTheDocument()
    })

    const globexItem = screen.getByText("Globex Inc")
    await user.click(globexItem)

    await waitFor(() => {
      expect(mockSetActiveOrg).toHaveBeenCalledWith("org-2")
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it("shows 'No organizations found' when list is empty", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <OrgSwitcher organizations={[]} />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("No organizations found")).toBeInTheDocument()
    })
  })

  it("disables button while switching organizations", async () => {
    const user = userEvent.setup()

    // Make the switch take time
    mockSetActiveOrg.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(
      <I18nTestWrapper locale="en">
        <OrgSwitcher organizations={mockOrganizations} activeOrgId="org-1" />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Globex Inc")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Globex Inc"))

    // Button should be disabled during the switch
    await waitFor(() => {
      expect(trigger).toBeDisabled()
    })

    // Wait for the switch to complete
    await waitFor(() => {
      expect(trigger).not.toBeDisabled()
    })
  })

  it("handles switch organization errors gracefully", async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    mockSetActiveOrg.mockRejectedValue(new Error("Switch failed"))

    render(
      <I18nTestWrapper locale="en">
        <OrgSwitcher organizations={mockOrganizations} activeOrgId="org-1" />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Globex Inc")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Globex Inc"))

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to switch organization",
        expect.any(Error)
      )
    })

    consoleErrorSpy.mockRestore()
  })

  it("renders in German locale", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="de">
        <OrgSwitcher organizations={[]} />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Organisation auswählen")).toBeInTheDocument()

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Organisationen")).toBeInTheDocument()
      expect(screen.getByText("Keine Organisationen gefunden")).toBeInTheDocument()
    })
  })

  it("truncates long organization names", () => {
    const longNameOrg = [
      { id: "org-long", name: "This Is A Very Long Organization Name That Should Be Truncated" },
    ]

    render(
      <I18nTestWrapper locale="en">
        <OrgSwitcher organizations={longNameOrg} activeOrgId="org-long" />
      </I18nTestWrapper>
    )

    const nameElement = screen.getByText(
      "This Is A Very Long Organization Name That Should Be Truncated"
    )
    expect(nameElement).toHaveClass("truncate")
  })
})
