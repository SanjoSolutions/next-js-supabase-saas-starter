import { createClient } from "@/lib/supabase/client"
import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { UpdatePasswordForm } from "./update-password-form"

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}))

// Mock Next.js router
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe("UpdatePasswordForm", () => {
  const mockUpdateUser = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        updateUser: mockUpdateUser,
      },
    })
  })

  it("renders the form correctly", () => {
    render(
      <I18nTestWrapper locale="en">
        <UpdatePasswordForm />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Reset Your Password")).toBeInTheDocument()
    expect(
      screen.getByText("Please enter your new password below.")
    ).toBeInTheDocument()
    expect(screen.getByLabelText("New password")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Save new password" })
    ).toBeInTheDocument()
  })

  it("renders the form in German", () => {
    render(
      <I18nTestWrapper locale="de">
        <UpdatePasswordForm />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Passwort zurücksetzen")).toBeInTheDocument()
    expect(screen.getByLabelText("Neues Passwort")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Neues Passwort speichern" })
    ).toBeInTheDocument()
  })

  it("submits the form successfully and redirects", async () => {
    mockUpdateUser.mockResolvedValue({ error: null })

    render(
      <I18nTestWrapper locale="en">
        <UpdatePasswordForm />
      </I18nTestWrapper>
    )

    const passwordInput = screen.getByLabelText("New password")
    fireEvent.change(passwordInput, { target: { value: "newSecurePassword123" } })

    const submitButton = screen.getByRole("button", { name: "Save new password" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: "newSecurePassword123" })
      expect(mockPush).toHaveBeenCalledWith("/protected")
    })
  })

  it("shows error message on failure", async () => {
    const passwordError = new Error("Password too weak")
    mockUpdateUser.mockResolvedValue({
      error: passwordError,
    })

    render(
      <I18nTestWrapper locale="en">
        <UpdatePasswordForm />
      </I18nTestWrapper>
    )

    const passwordInput = screen.getByLabelText("New password")
    fireEvent.change(passwordInput, { target: { value: "weak" } })

    const submitButton = screen.getByRole("button", { name: "Save new password" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Password too weak")).toBeInTheDocument()
    })

    // Should not redirect on error
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("shows generic error for non-Error exceptions", async () => {
    mockUpdateUser.mockRejectedValue("Unknown error")

    render(
      <I18nTestWrapper locale="en">
        <UpdatePasswordForm />
      </I18nTestWrapper>
    )

    const passwordInput = screen.getByLabelText("New password")
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    const submitButton = screen.getByRole("button", { name: "Save new password" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("An error occurred")).toBeInTheDocument()
    })
  })

  it("shows loading state while submitting", async () => {
    mockUpdateUser.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    )

    render(
      <I18nTestWrapper locale="en">
        <UpdatePasswordForm />
      </I18nTestWrapper>
    )

    const passwordInput = screen.getByLabelText("New password")
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    const submitButton = screen.getByRole("button", { name: "Save new password" })
    fireEvent.click(submitButton)

    // Should show loading state
    expect(screen.getByRole("button", { name: "Saving..." })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/protected")
    })
  })

  it("applies custom className", () => {
    render(
      <I18nTestWrapper locale="en">
        <UpdatePasswordForm className="custom-class" />
      </I18nTestWrapper>
    )

    // The FormCard receives the className
    const formCard = screen.getByText("Reset Your Password").closest(".custom-class")
    expect(formCard).toBeInTheDocument()
  })

  it("clears error when resubmitting", async () => {
    // First submission fails
    const formatError = new Error("Invalid password format")
    mockUpdateUser.mockResolvedValueOnce({
      error: formatError,
    })

    render(
      <I18nTestWrapper locale="en">
        <UpdatePasswordForm />
      </I18nTestWrapper>
    )

    const passwordInput = screen.getByLabelText("New password")
    fireEvent.change(passwordInput, { target: { value: "bad" } })

    const submitButton = screen.getByRole("button", { name: "Save new password" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Invalid password format")).toBeInTheDocument()
    })

    // Second submission succeeds
    mockUpdateUser.mockResolvedValueOnce({ error: null })
    fireEvent.change(passwordInput, { target: { value: "goodPassword123!" } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText("Invalid password format")).not.toBeInTheDocument()
      expect(mockPush).toHaveBeenCalledWith("/protected")
    })
  })

  it("password input has correct type", () => {
    render(
      <I18nTestWrapper locale="en">
        <UpdatePasswordForm />
      </I18nTestWrapper>
    )

    const passwordInput = screen.getByLabelText("New password")
    expect(passwordInput).toHaveAttribute("type", "password")
  })
})
