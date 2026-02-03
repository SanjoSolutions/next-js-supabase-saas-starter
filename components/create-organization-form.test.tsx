import { createClient } from "@/lib/supabase/client"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CreateOrganizationForm } from "./create-organization-form"
import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}))

// Mock Next.js router
const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockSetActiveOrg = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

vi.mock("@/app/[locale]/(authenticated)/organizations/actions", () => ({
  setActiveOrganizationAction: (...args: any[]) => mockSetActiveOrg(...args),
}))

describe("CreateOrganizationForm", () => {
  const mockInsert = vi.fn()
  const mockFrom = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createClient as any).mockReturnValue({
      from: mockFrom,
    })
    mockFrom.mockReturnValue({
      insert: mockInsert,
    })
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi
          .fn()
          .mockResolvedValue({ data: { id: 1, name: "Test Org" }, error: null }),
      }),
    })
  })

  it("renders the form", () => {
    render(
      <I18nTestWrapper locale="en">
        <CreateOrganizationForm />
      </I18nTestWrapper>
    )
    expect(
      screen.getByText("Create Organization", { selector: ".font-semibold" })
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Create Organization" })
    ).toBeInTheDocument()
  })

  it("renders the form in German", () => {
    render(
      <I18nTestWrapper locale="de">
        <CreateOrganizationForm />
      </I18nTestWrapper>
    )
    expect(
      screen.getByText("Organisation erstellen", { selector: ".font-semibold" })
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Organisation erstellen" })
    ).toBeInTheDocument()
  })

  it("submits the form successfully", async () => {
    render(
      <I18nTestWrapper locale="en">
        <CreateOrganizationForm />
      </I18nTestWrapper>
    )

    const input = screen.getByLabelText("Name")
    fireEvent.change(input, { target: { value: "New Org" } })

    const button = screen.getByRole("button", { name: /create organization/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("organizations")
      expect(mockInsert).toHaveBeenCalledWith([{ name: "New Org" }])
      expect(mockSetActiveOrg).toHaveBeenCalledWith(1)
      expect(mockPush).toHaveBeenCalledWith("/organizations/1/welcome")
    })
  })

  it("shows error message on failure", async () => {
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi
          .fn()
          .mockResolvedValue({
            data: null,
            error: { message: "Failed to create" },
          }),
      }),
    })

    render(
      <I18nTestWrapper locale="en">
        <CreateOrganizationForm />
      </I18nTestWrapper>
    )

    const input = screen.getByLabelText("Name")
    fireEvent.change(input, { target: { value: "Error Org" } })

    const button = screen.getByRole("button", { name: /create organization/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(
        screen.getByText(
          "An error occurred while creating the organization"
        )
      ).toBeInTheDocument()
    })
  })
})
