import { createClient } from "@/lib/supabase/client"
import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InviteForm } from "./invite-form"

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}))

describe("InviteForm", () => {
  const mockGetUser = vi.fn()
  const mockInsert = vi.fn()
  const mockFrom = vi.fn()
  const mockSelect = vi.fn()
  const mockSingle = vi.fn()

  const activeOrgId = "org-123"

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock window.location.origin
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    })

    // Setup Supabase mock chain
    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    })

    mockFrom.mockReturnValue({ insert: mockInsert })
    mockInsert.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ single: mockSingle })

    // Default: user is authenticated
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "user@example.com" } },
    })
  })

  it("renders the form correctly", () => {
    render(
      <I18nTestWrapper locale="en">
        <InviteForm activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Invite Member")).toBeInTheDocument()
    expect(
      screen.getByText("Send an invitation to join your organization.")
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Create Invite" })
    ).toBeInTheDocument()
  })

  it("renders the form in German", () => {
    render(
      <I18nTestWrapper locale="de">
        <InviteForm activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Mitglied einladen")).toBeInTheDocument()
  })

  it("submits the form successfully and shows invite link", async () => {
    const mockToken = "invite-token-abc123"
    mockSingle.mockResolvedValue({
      data: { token: mockToken },
      error: null,
    })

    render(
      <I18nTestWrapper locale="en">
        <InviteForm activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email Address")
    fireEvent.change(emailInput, { target: { value: "colleague@example.com" } })

    const submitButton = screen.getByRole("button", { name: "Create Invite" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Invite created successfully!")).toBeInTheDocument()
    })

    // Check invite link is displayed
    expect(
      screen.getByText(`http://localhost:3000/invites/accept?token=${mockToken}`)
    ).toBeInTheDocument()

    // Verify Supabase was called correctly
    expect(mockFrom).toHaveBeenCalledWith("invites")
    expect(mockInsert).toHaveBeenCalledWith([
      {
        email: "colleague@example.com",
        organization_id: activeOrgId,
        inviter_id: "user-123",
      },
    ])
  })

  it("clears email input after successful submission", async () => {
    mockSingle.mockResolvedValue({
      data: { token: "token-123" },
      error: null,
    })

    render(
      <I18nTestWrapper locale="en">
        <InviteForm activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email Address") as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    expect(emailInput.value).toBe("test@example.com")

    const submitButton = screen.getByRole("button", { name: "Create Invite" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(emailInput.value).toBe("")
    })
  })

  it("shows error when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    render(
      <I18nTestWrapper locale="en">
        <InviteForm activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email Address")
    fireEvent.change(emailInput, { target: { value: "test@example.com" } })

    const submitButton = screen.getByRole("button", { name: "Create Invite" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Not authenticated")).toBeInTheDocument()
    })
  })

  it("shows error when invite creation fails", async () => {
    // Supabase errors have a message property
    const supabaseError = new Error("Duplicate email")
    mockSingle.mockRejectedValue(supabaseError)

    render(
      <I18nTestWrapper locale="en">
        <InviteForm activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email Address")
    fireEvent.change(emailInput, { target: { value: "existing@example.com" } })

    const submitButton = screen.getByRole("button", { name: "Create Invite" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Duplicate email")).toBeInTheDocument()
    })
  })

  it("shows generic error for non-Error exceptions", async () => {
    mockGetUser.mockRejectedValue("Unknown error")

    render(
      <I18nTestWrapper locale="en">
        <InviteForm activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email Address")
    fireEvent.change(emailInput, { target: { value: "test@example.com" } })

    const submitButton = screen.getByRole("button", { name: "Create Invite" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Failed to create invite")).toBeInTheDocument()
    })
  })

  it("shows loading state while submitting", async () => {
    // Make the submission take time
    mockSingle.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { token: "token" }, error: null }), 100)
        )
    )

    render(
      <I18nTestWrapper locale="en">
        <InviteForm activeOrgId={activeOrgId} />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email Address")
    fireEvent.change(emailInput, { target: { value: "test@example.com" } })

    const submitButton = screen.getByRole("button", { name: "Create Invite" })
    fireEvent.click(submitButton)

    // Should show loading state
    expect(screen.getByRole("button", { name: "Sending..." })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled()

    // Wait for completion
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Create Invite" })
      ).toBeInTheDocument()
    })
  })

  it("applies custom className", () => {
    render(
      <I18nTestWrapper locale="en">
        <InviteForm activeOrgId={activeOrgId} className="custom-class" />
      </I18nTestWrapper>
    )

    // The FormCard should have the custom class
    const formCard = screen.getByText("Invite Member").closest(".custom-class")
    expect(formCard).toBeInTheDocument()
  })
})
