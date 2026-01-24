import { createClient } from "@/lib/supabase/client"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CreateOrganizationForm } from "./create-organization-form"

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

vi.mock("@/app/organizations/actions", () => ({
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
        single: vi.fn().mockResolvedValue({ data: { id: 1, name: "Test Org" }, error: null }),
      }),
    })
  })

  it("renders the form", () => {
    render(<CreateOrganizationForm />)
    expect(screen.getByText("Create Organization", { selector: ".font-semibold" })).toBeInTheDocument()
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create Organization" })).toBeInTheDocument()
  })

  it("submits the form successfully", async () => {
    render(<CreateOrganizationForm />)
    
    const input = screen.getByLabelText("Name")
    fireEvent.change(input, { target: { value: "New Org" } })
    
    const button = screen.getByRole("button", { name: /create organization/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("organizations")
      expect(mockInsert).toHaveBeenCalledWith([{ name: "New Org" }])
      expect(mockSetActiveOrg).toHaveBeenCalledWith(1)
      expect(mockPush).toHaveBeenCalledWith("/protected")
    })
  })

  it("shows error message on failure", async () => {
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "Failed to create" } }),
      }),
    })

    render(<CreateOrganizationForm />)
    
    const input = screen.getByLabelText("Name")
    fireEvent.change(input, { target: { value: "Error Org" } })
    
    const button = screen.getByRole("button", { name: /create organization/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText("An error occurred while creating the organization")).toBeInTheDocument()
    })
  })
})
