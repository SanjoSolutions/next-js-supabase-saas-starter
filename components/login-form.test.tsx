import { createClient } from "@/lib/supabase/client"
import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LoginForm } from "./login-form"

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

// Mock Next.js navigation
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}))

describe("LoginForm", () => {
  const mockSignInWithPassword = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete("return_url")

    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    })
  })

  it("renders the form correctly", () => {
    render(
      <I18nTestWrapper locale="en">
        <LoginForm />
      </I18nTestWrapper>
    )

    // Title appears in FormCard heading
    expect(
      screen.getByText("Enter your email below to login to your account")
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    // "Login" appears as both title and button - check button specifically
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument()
    expect(screen.getByText("Forgot your password?")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument()
  })

  it("renders the form in German", () => {
    render(
      <I18nTestWrapper locale="de">
        <LoginForm />
      </I18nTestWrapper>
    )

    // "Anmelden" appears as both title and button
    expect(screen.getByRole("button", { name: "Anmelden" })).toBeInTheDocument()
    expect(screen.getByLabelText("E-Mail")).toBeInTheDocument()
    expect(screen.getByLabelText("Passwort")).toBeInTheDocument()
  })

  it("submits the form successfully and redirects to /protected", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })

    render(
      <I18nTestWrapper locale="en">
        <LoginForm />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    fireEvent.change(emailInput, { target: { value: "user@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    const submitButton = screen.getByRole("button", { name: "Login" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      })
      expect(mockPush).toHaveBeenCalledWith("/protected")
    })
  })

  it("redirects to return_url when provided", async () => {
    mockSearchParams.set("return_url", "/organizations/123/welcome")
    mockSignInWithPassword.mockResolvedValue({ error: null })

    render(
      <I18nTestWrapper locale="en">
        <LoginForm />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    fireEvent.change(emailInput, { target: { value: "user@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    const submitButton = screen.getByRole("button", { name: "Login" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/organizations/123/welcome")
    })
  })

  it("shows error message on login failure", async () => {
    const loginError = new Error("Invalid credentials")
    mockSignInWithPassword.mockResolvedValue({ error: loginError })

    render(
      <I18nTestWrapper locale="en">
        <LoginForm />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } })

    const submitButton = screen.getByRole("button", { name: "Login" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it("shows generic error for non-Error exceptions", async () => {
    mockSignInWithPassword.mockRejectedValue("Unknown error")

    render(
      <I18nTestWrapper locale="en">
        <LoginForm />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    fireEvent.change(emailInput, { target: { value: "user@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    const submitButton = screen.getByRole("button", { name: "Login" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("An error occurred")).toBeInTheDocument()
    })
  })

  it("shows loading state while submitting", async () => {
    mockSignInWithPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    )

    render(
      <I18nTestWrapper locale="en">
        <LoginForm />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    fireEvent.change(emailInput, { target: { value: "user@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    const submitButton = screen.getByRole("button", { name: "Login" })
    fireEvent.click(submitButton)

    expect(screen.getByRole("button", { name: "Logging in..." })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Logging in..." })).toBeDisabled()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
    })
  })

  it("has links to forgot password and sign up pages", () => {
    render(
      <I18nTestWrapper locale="en">
        <LoginForm />
      </I18nTestWrapper>
    )

    const forgotPasswordLink = screen.getByRole("link", { name: "Forgot your password?" })
    expect(forgotPasswordLink).toHaveAttribute("href", "/auth/forgot-password")

    const signUpLink = screen.getByRole("link", { name: "Sign up" })
    expect(signUpLink).toHaveAttribute("href", "/auth/sign-up")
  })

  it("applies custom className", () => {
    render(
      <I18nTestWrapper locale="en">
        <LoginForm className="custom-class" />
      </I18nTestWrapper>
    )

    const formCard = screen.getByLabelText("Email").closest(".custom-class")
    expect(formCard).toBeInTheDocument()
  })

  it("clears error when resubmitting", async () => {
    const loginError = new Error("First error")
    mockSignInWithPassword.mockResolvedValueOnce({ error: loginError })

    render(
      <I18nTestWrapper locale="en">
        <LoginForm />
      </I18nTestWrapper>
    )

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    fireEvent.change(emailInput, { target: { value: "user@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    const submitButton = screen.getByRole("button", { name: "Login" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument()
    })

    mockSignInWithPassword.mockResolvedValueOnce({ error: null })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText("First error")).not.toBeInTheDocument()
      expect(mockPush).toHaveBeenCalled()
    })
  })

  it("password input has correct type", () => {
    render(
      <I18nTestWrapper locale="en">
        <LoginForm />
      </I18nTestWrapper>
    )

    const passwordInput = screen.getByLabelText("Password")
    expect(passwordInput).toHaveAttribute("type", "password")
  })
})
