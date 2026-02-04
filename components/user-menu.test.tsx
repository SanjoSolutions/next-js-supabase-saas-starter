import { createClient } from "@/lib/supabase/client"
import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { UserMenu } from "./user-menu"

// Mock Supabase client
const mockSignOut = vi.fn()
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}))

// Mock next-intl navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

describe("UserMenu", () => {
  const mockUser = {
    email: "user@example.com",
    user_metadata: {
      first_name: "John",
    },
  }

  const activeOrgId = "org-123"

  beforeEach(() => {
    vi.clearAllMocks()

    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        signOut: mockSignOut,
      },
    })

    mockSignOut.mockResolvedValue({ error: null })
  })

  it("renders the avatar with user initials from first name", () => {
    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={mockUser} activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    expect(screen.getByText("J")).toBeInTheDocument()
  })

  it("renders the avatar with email initial when no first name", () => {
    const userWithoutFirstName = {
      email: "alice@example.com",
    }

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={userWithoutFirstName} activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("opens dropdown menu when clicked", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={mockUser} activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument()
      expect(screen.getByText("user@example.com")).toBeInTheDocument()
    })
  })

  it("shows organization menu items when activeOrgId is provided", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={mockUser} activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Members")).toBeInTheDocument()
      expect(screen.getByText("Invite")).toBeInTheDocument()
      expect(screen.getByText("Billing")).toBeInTheDocument()
    })
  })

  it("hides organization menu items when no activeOrgId", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={mockUser} />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.queryByText("Members")).not.toBeInTheDocument()
      expect(screen.queryByText("Invite")).not.toBeInTheDocument()
      expect(screen.queryByText("Billing")).not.toBeInTheDocument()
    })

    // But should still show Create Organization and Logout
    expect(screen.getByText("Create Organization")).toBeInTheDocument()
    expect(screen.getByText("Logout")).toBeInTheDocument()
  })

  it("shows Activity menu item when hasActivityDashboard is true", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={mockUser} activeOrgId={activeOrgId} hasActivityDashboard />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Activity")).toBeInTheDocument()
    })
  })

  it("hides Activity menu item when hasActivityDashboard is false", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={mockUser} activeOrgId={activeOrgId} hasActivityDashboard={false} />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Members")).toBeInTheDocument()
      expect(screen.queryByText("Activity")).not.toBeInTheDocument()
    })
  })

  it("navigates to members page when Members is clicked", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={mockUser} activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Members")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Members"))

    expect(mockPush).toHaveBeenCalledWith("/organizations/org-123/members")
  })

  it("navigates to invite page when Invite is clicked", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={mockUser} activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Invite")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Invite"))

    expect(mockPush).toHaveBeenCalledWith("/invites/new")
  })

  it("navigates to billing page when Billing is clicked", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={mockUser} activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Billing")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Billing"))

    expect(mockPush).toHaveBeenCalledWith("/organizations/org-123/billing")
  })

  it("navigates to activity page when Activity is clicked", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={mockUser} activeOrgId={activeOrgId} hasActivityDashboard />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Activity")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Activity"))

    expect(mockPush).toHaveBeenCalledWith("/organizations/org-123/activity")
  })

  it("navigates to create organization page when Create Organization is clicked", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={mockUser} activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Create Organization")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Create Organization"))

    expect(mockPush).toHaveBeenCalledWith("/organizations/new")
  })

  it("logs out and redirects when Logout is clicked", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={mockUser} activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Logout"))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith("/")
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it("shows email only when no first name", async () => {
    const user = userEvent.setup()
    const userWithoutFirstName = {
      email: "nofirstname@example.com",
    }

    render(
      <I18nTestWrapper locale="en">
        <UserMenu user={userWithoutFirstName} activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("nofirstname@example.com")).toBeInTheDocument()
    })
  })

  it("renders in German locale", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="de">
        <UserMenu user={mockUser} activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const trigger = screen.getByRole("button")
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText("Mitglieder")).toBeInTheDocument()
      expect(screen.getByText("Einladen")).toBeInTheDocument()
      expect(screen.getByText("Abrechnung")).toBeInTheDocument()
      expect(screen.getByText("Organisation erstellen")).toBeInTheDocument()
      expect(screen.getByText("Abmelden")).toBeInTheDocument()
    })
  })
})
