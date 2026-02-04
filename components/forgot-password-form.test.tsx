import { createClient } from "@/lib/supabase/client"
import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ForgotPasswordForm } from "./forgot-password-form"

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}))

// Mock next-intl navigation
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe("ForgotPasswordForm", () => {
  const mockResetPasswordForEmail = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock window.location.origin
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    })

    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        resetPasswordForEmail: mockResetPasswordForEmail,
      },
    })
  })

  it("renders the form correctly", () => {
    render(
      <I18nTestWrapper locale="en">
        <ForgotPasswordForm />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Reset Your Password")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Type in your email and we'll send you a link to reset your password"
      )
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Send reset email" })
    ).toBeInTheDocument()
    expect(screen.getByText("Login")).toBeInTheDocument()
  })

  it("renders the form in German", () => {
    render(
      <I18nTestWrapper locale="de">
        <ForgotPasswordForm />
      </I18nTestWrapper>
    )

    expect(screen.getByText("Passwort zurücksetzen")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Link senden" })).toBeInTheDocument()
  })

  it("submits the form successfully and shows success message", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })

    render(
      <I18nTestWrapper locale="en">
        <ForgotPasswordForm />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email")
    fireEvent.change(emailInput, { target: { value: "user@example.com" } })

    const submitButton = screen.getByRole("button", { name: "Send reset email" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Check Your Email")).toBeInTheDocument()
      expect(
        screen.getByText("Password reset instructions sent")
      ).toBeInTheDocument()
    })

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith("user@example.com", {
      redirectTo: "http://localhost:3000/auth/update-password",
    })
  })

  it("shows error message on failure", async () => {
    // Supabase throws the error object, which we need to simulate
    const supabaseError = new Error("User not found")
    mockResetPasswordForEmail.mockResolvedValue({
      error: supabaseError,
    })

    render(
      <I18nTestWrapper locale="en">
        <ForgotPasswordForm />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email")
    fireEvent.change(emailInput, { target: { value: "unknown@example.com" } })

    const submitButton = screen.getByRole("button", { name: "Send reset email" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("User not found")).toBeInTheDocument()
    })

    // Form should still be visible (not success state)
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
  })

  it("shows generic error for non-Error exceptions", async () => {
    mockResetPasswordForEmail.mockRejectedValue("Unknown error")

    render(
      <I18nTestWrapper locale="en">
        <ForgotPasswordForm />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email")
    fireEvent.change(emailInput, { target: { value: "test@example.com" } })

    const submitButton = screen.getByRole("button", { name: "Send reset email" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("An error occurred")).toBeInTheDocument()
    })
  })

  it("shows loading state while submitting", async () => {
    mockResetPasswordForEmail.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    )

    render(
      <I18nTestWrapper locale="en">
        <ForgotPasswordForm />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email")
    fireEvent.change(emailInput, { target: { value: "user@example.com" } })

    const submitButton = screen.getByRole("button", { name: "Send reset email" })
    fireEvent.click(submitButton)

    // Should show loading state
    expect(screen.getByRole("button", { name: "Sending..." })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText("Check Your Email")).toBeInTheDocument()
    })
  })

  it("has a link to login page", () => {
    render(
      <I18nTestWrapper locale="en">
        <ForgotPasswordForm />
      </I18nTestWrapper>
    )

    const loginLink = screen.getByRole("link", { name: "Login" })
    expect(loginLink).toHaveAttribute("href", "/auth/login")
  })

  it("applies custom className", () => {
    const { container } = render(
      <I18nTestWrapper locale="en">
        <ForgotPasswordForm className="custom-class" />
      </I18nTestWrapper>
    )

    expect(container.firstChild).toHaveClass("custom-class")
  })

  it("clears error when resubmitting", async () => {
    // First submission fails
    const rateLimitError = new Error("Rate limit exceeded")
    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: rateLimitError,
    })

    render(
      <I18nTestWrapper locale="en">
        <ForgotPasswordForm />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email")
    fireEvent.change(emailInput, { target: { value: "user@example.com" } })

    const submitButton = screen.getByRole("button", { name: "Send reset email" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument()
    })

    // Second submission succeeds
    mockResetPasswordForEmail.mockResolvedValueOnce({ error: null })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText("Rate limit exceeded")).not.toBeInTheDocument()
      expect(screen.getByText("Check Your Email")).toBeInTheDocument()
    })
  })
})
