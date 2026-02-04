import { createClient } from "@/lib/supabase/client"
import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SignUpForm } from "./sign-up-form"

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

describe("SignUpForm", () => {
  const mockSignUp = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete("return_url")

    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        signUp: mockSignUp,
      },
    })
  })

  it("renders the form correctly", () => {
    render(
      <I18nTestWrapper locale="en">
        <SignUpForm />
      </I18nTestWrapper>
    )

    // "Sign up" appears as both title and button
    expect(screen.getByText("Create a new account")).toBeInTheDocument()
    expect(screen.getByLabelText("First Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByLabelText("Repeat Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument()
  })

  it("renders the form in German", () => {
    render(
      <I18nTestWrapper locale="de">
        <SignUpForm />
      </I18nTestWrapper>
    )

    // "Registrieren" appears as both title and button
    expect(screen.getByRole("button", { name: "Registrieren" })).toBeInTheDocument()
    expect(screen.getByLabelText("Vorname")).toBeInTheDocument()
    expect(screen.getByLabelText("E-Mail")).toBeInTheDocument()
    expect(screen.getByLabelText("Passwort")).toBeInTheDocument()
    expect(screen.getByLabelText("Passwort wiederholen")).toBeInTheDocument()
  })

  it("submits the form successfully and redirects to /protected", async () => {
    mockSignUp.mockResolvedValue({ error: null })

    render(
      <I18nTestWrapper locale="en">
        <SignUpForm />
      </I18nTestWrapper>
    )

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    })
    fireEvent.change(screen.getByLabelText("Repeat Password"), {
      target: { value: "password123" },
    })

    const submitButton = screen.getByRole("button", { name: "Sign up" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "john@example.com",
        password: "password123",
        options: {
          data: {
            first_name: "John",
          },
        },
      })
      expect(mockPush).toHaveBeenCalledWith("/protected")
    })
  })

  it("redirects to return_url when provided", async () => {
    mockSearchParams.set("return_url", "/invites/accept?token=abc")
    mockSignUp.mockResolvedValue({ error: null })

    render(
      <I18nTestWrapper locale="en">
        <SignUpForm />
      </I18nTestWrapper>
    )

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Jane" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    })
    fireEvent.change(screen.getByLabelText("Repeat Password"), {
      target: { value: "password123" },
    })

    const submitButton = screen.getByRole("button", { name: "Sign up" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/invites/accept?token=abc")
    })
  })

  it("shows error when passwords do not match", async () => {
    render(
      <I18nTestWrapper locale="en">
        <SignUpForm />
      </I18nTestWrapper>
    )

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    })
    fireEvent.change(screen.getByLabelText("Repeat Password"), {
      target: { value: "differentpassword" },
    })

    const submitButton = screen.getByRole("button", { name: "Sign up" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
    })

    // Should not call signUp or redirect
    expect(mockSignUp).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("shows password mismatch error in German", async () => {
    render(
      <I18nTestWrapper locale="de">
        <SignUpForm />
      </I18nTestWrapper>
    )

    fireEvent.change(screen.getByLabelText("Vorname"), {
      target: { value: "Hans" },
    })
    fireEvent.change(screen.getByLabelText("E-Mail"), {
      target: { value: "hans@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Passwort"), {
      target: { value: "password123" },
    })
    fireEvent.change(screen.getByLabelText("Passwort wiederholen"), {
      target: { value: "different" },
    })

    const submitButton = screen.getByRole("button", { name: "Registrieren" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText("Passwörter stimmen nicht überein")
      ).toBeInTheDocument()
    })
  })

  it("shows error message on signup failure", async () => {
    const signupError = new Error("Email already registered")
    mockSignUp.mockResolvedValue({ error: signupError })

    render(
      <I18nTestWrapper locale="en">
        <SignUpForm />
      </I18nTestWrapper>
    )

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "existing@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    })
    fireEvent.change(screen.getByLabelText("Repeat Password"), {
      target: { value: "password123" },
    })

    const submitButton = screen.getByRole("button", { name: "Sign up" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Email already registered")).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it("shows generic error for non-Error exceptions", async () => {
    mockSignUp.mockRejectedValue("Unknown error")

    render(
      <I18nTestWrapper locale="en">
        <SignUpForm />
      </I18nTestWrapper>
    )

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    })
    fireEvent.change(screen.getByLabelText("Repeat Password"), {
      target: { value: "password123" },
    })

    const submitButton = screen.getByRole("button", { name: "Sign up" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("An error occurred")).toBeInTheDocument()
    })
  })

  it("shows loading state while submitting", async () => {
    mockSignUp.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    )

    render(
      <I18nTestWrapper locale="en">
        <SignUpForm />
      </I18nTestWrapper>
    )

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    })
    fireEvent.change(screen.getByLabelText("Repeat Password"), {
      target: { value: "password123" },
    })

    const submitButton = screen.getByRole("button", { name: "Sign up" })
    fireEvent.click(submitButton)

    expect(
      screen.getByRole("button", { name: "Creating an account..." })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Creating an account..." })
    ).toBeDisabled()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
    })
  })

  it("has link to login page", () => {
    render(
      <I18nTestWrapper locale="en">
        <SignUpForm />
      </I18nTestWrapper>
    )

    const loginLink = screen.getByRole("link", { name: "Login" })
    expect(loginLink).toHaveAttribute("href", "/auth/login")
  })

  it("applies custom className", () => {
    render(
      <I18nTestWrapper locale="en">
        <SignUpForm className="custom-class" />
      </I18nTestWrapper>
    )

    const formCard = screen.getByLabelText("Email").closest(".custom-class")
    expect(formCard).toBeInTheDocument()
  })

  it("password inputs have correct type", () => {
    render(
      <I18nTestWrapper locale="en">
        <SignUpForm />
      </I18nTestWrapper>
    )

    const passwordInput = screen.getByLabelText("Password")
    const repeatPasswordInput = screen.getByLabelText("Repeat Password")

    expect(passwordInput).toHaveAttribute("type", "password")
    expect(repeatPasswordInput).toHaveAttribute("type", "password")
  })

  it("includes first_name in user metadata on signup", async () => {
    mockSignUp.mockResolvedValue({ error: null })

    render(
      <I18nTestWrapper locale="en">
        <SignUpForm />
      </I18nTestWrapper>
    )

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Alice" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alice@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    })
    fireEvent.change(screen.getByLabelText("Repeat Password"), {
      target: { value: "password123" },
    })

    const submitButton = screen.getByRole("button", { name: "Sign up" })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: {
            data: {
              first_name: "Alice",
            },
          },
        })
      )
    })
  })
})
