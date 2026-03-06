import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"
import { SocialAuthButtons } from "./social-auth-buttons"

const mockSignInWithOAuth = vi.fn()

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  }),
}))

describe("SocialAuthButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders responsive social login buttons with room for the label text", () => {
    render(
      <I18nTestWrapper locale="en">
        <SocialAuthButtons />
      </I18nTestWrapper>
    )

    const googleButton = screen.getByRole("button", {
      name: "Continue with Google",
    })
    const githubButton = screen.getByRole("button", {
      name: "Continue with GitHub",
    })

    expect(googleButton).toHaveClass(
      "h-auto",
      "min-h-11",
      "justify-start",
      "whitespace-normal",
      "px-4",
      "py-3",
      "text-left",
      "leading-tight"
    )
    expect(githubButton).toHaveClass(
      "h-auto",
      "min-h-11",
      "justify-start",
      "whitespace-normal",
      "px-4",
      "py-3",
      "text-left",
      "leading-tight"
    )
  })
})
