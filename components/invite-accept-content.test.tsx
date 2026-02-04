import { createClient } from "@/lib/supabase/client"
import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InviteAcceptContent } from "./invite-accept-content"

// Mock Supabase client
const mockRpc = vi.fn()
const mockSingle = vi.fn()
const mockGetUser = vi.fn()

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}))

// Mock acceptInviteAction
const mockAcceptInviteAction = vi.fn()
vi.mock("@/app/[locale]/(authenticated)/organizations/actions", () => ({
  acceptInviteAction: (...args: unknown[]) => mockAcceptInviteAction(...args),
}))

// Mock Next.js navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Spy on console.error
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

describe("InviteAcceptContent", () => {
  const token = "invite-token-abc123"

  const mockInviteData = {
    id: "invite-1",
    email: "invitee@example.com",
    role: "member",
    organization_name: "Acme Corp",
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: { href: "http://localhost:3000/invites/accept?token=abc" },
      writable: true,
    })

    // Setup default Supabase mock
    mockSingle.mockResolvedValue({ data: mockInviteData, error: null })
    mockRpc.mockReturnValue({ single: mockSingle })

    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      rpc: mockRpc,
      auth: {
        getUser: mockGetUser,
      },
    })

    // Default: user is authenticated
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "invitee@example.com" } },
    })
  })

  it("shows loading state initially", () => {
    // Make RPC never resolve to keep loading state
    mockSingle.mockReturnValue(new Promise(() => {}))

    render(
      <I18nTestWrapper locale="en">
        <InviteAcceptContent token={token} />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Loading invitation...")).toBeInTheDocument()
  })

  it("fetches and displays invite details", async () => {
    render(
      <I18nTestWrapper locale="en">
        <InviteAcceptContent token={token} />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText("Organization Invitation")).toBeInTheDocument()
      expect(screen.getByText("Acme Corp")).toBeInTheDocument()
      expect(screen.getByText(/member/)).toBeInTheDocument()
    })

    expect(mockRpc).toHaveBeenCalledWith("get_invite_details", {
      invite_token: token,
    })
  })

  it("shows accept button when invite is loaded", async () => {
    render(
      <I18nTestWrapper locale="en">
        <InviteAcceptContent token={token} />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Accept Invitation" })
      ).toBeInTheDocument()
    })
  })

  it("shows error when invite is not found", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "Not found" } })

    render(
      <I18nTestWrapper locale="en">
        <InviteAcceptContent token={token} />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.getByText("Invite not found or expired")
      ).toBeInTheDocument()
    })

    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it("accepts invite and redirects to welcome page", async () => {
    const user = userEvent.setup()
    mockAcceptInviteAction.mockResolvedValue({ organizationId: "org-456" })

    render(
      <I18nTestWrapper locale="en">
        <InviteAcceptContent token={token} />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Accept Invitation" })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Accept Invitation" }))

    await waitFor(() => {
      expect(mockAcceptInviteAction).toHaveBeenCalledWith(token)
      expect(mockPush).toHaveBeenCalledWith("/organizations/org-456/welcome")
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it("redirects to sign-up when user is not authenticated", async () => {
    const user = userEvent.setup()
    mockGetUser.mockResolvedValue({ data: { user: null } })

    render(
      <I18nTestWrapper locale="en">
        <InviteAcceptContent token={token} />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Accept Invitation" })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Accept Invitation" }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/auth/sign-up?return_url=")
      )
    })

    // Should not call acceptInviteAction
    expect(mockAcceptInviteAction).not.toHaveBeenCalled()
  })

  it("shows error when accept action fails", async () => {
    const user = userEvent.setup()
    mockAcceptInviteAction.mockRejectedValue(new Error("Failed to accept invite"))

    render(
      <I18nTestWrapper locale="en">
        <InviteAcceptContent token={token} />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Accept Invitation" })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Accept Invitation" }))

    await waitFor(() => {
      expect(screen.getByText("Failed to accept invite")).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it("shows generic error for non-Error exceptions", async () => {
    const user = userEvent.setup()
    mockAcceptInviteAction.mockRejectedValue("Unknown error")

    render(
      <I18nTestWrapper locale="en">
        <InviteAcceptContent token={token} />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Accept Invitation" })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Accept Invitation" }))

    await waitFor(() => {
      expect(screen.getByText("Failed to accept invite")).toBeInTheDocument()
    })
  })

  it("shows processing state while accepting", async () => {
    const user = userEvent.setup()
    mockAcceptInviteAction.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ organizationId: "org-123" }), 100)
        )
    )

    render(
      <I18nTestWrapper locale="en">
        <InviteAcceptContent token={token} />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Accept Invitation" })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Accept Invitation" }))

    expect(screen.getByRole("button", { name: "Accepting..." })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Accepting..." })).toBeDisabled()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
    })
  })

  it("shows 'not found' message when invite data is null and no error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: null })

    render(
      <I18nTestWrapper locale="en">
        <InviteAcceptContent token={token} />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.getByText("Invite not found or expired")
      ).toBeInTheDocument()
    })
  })

  it("renders in German locale", async () => {
    render(
      <I18nTestWrapper locale="de">
        <InviteAcceptContent token={token} />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText("Organisations-Einladung")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Einladung annehmen" })
      ).toBeInTheDocument()
    })
  })
})
