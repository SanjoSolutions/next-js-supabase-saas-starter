import { beforeEach, describe, expect, it, vi } from "vitest"
import { requireUser, requireOrgMember } from "./auth"

// Mock the redirect function from next/navigation
const mockRedirect = vi.fn()
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url)
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))

// Mock Supabase client
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

describe("auth", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default chain for from().select().eq().eq().single()
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle })
  })

  describe("requireUser", () => {
    it("returns the user when authenticated", async () => {
      const mockUser = { id: "user-123", email: "test@example.com" }
      mockGetUser.mockResolvedValue({ data: { user: mockUser } })

      const result = await requireUser()

      expect(result).toEqual(mockUser)
      expect(mockGetUser).toHaveBeenCalledOnce()
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it("redirects to login when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      await expect(requireUser()).rejects.toThrow("NEXT_REDIRECT:/auth/login")
      expect(mockRedirect).toHaveBeenCalledWith("/auth/login")
    })

    it("redirects to login when data is undefined", async () => {
      mockGetUser.mockResolvedValue({ data: undefined })

      await expect(requireUser()).rejects.toThrow("NEXT_REDIRECT:/auth/login")
      expect(mockRedirect).toHaveBeenCalledWith("/auth/login")
    })
  })

  describe("requireOrgMember", () => {
    const mockUser = { id: "user-123", email: "test@example.com" }
    const orgId = "org-456"

    beforeEach(() => {
      // Default: user is authenticated
      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    })

    it("returns user, membership, and organization when user is a member", async () => {
      const mockMembership = { role: "member" }
      const mockOrganization = {
        name: "Test Org",
        plan: "pro",
        subscription_status: "active",
      }

      // First call: memberships query
      // Second call: organizations query
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: mockMembership })
        }
        return Promise.resolve({ data: mockOrganization })
      })

      const result = await requireOrgMember(orgId)

      expect(result).toEqual({
        user: mockUser,
        membership: mockMembership,
        organization: mockOrganization,
      })
      expect(mockFrom).toHaveBeenCalledWith("memberships")
      expect(mockFrom).toHaveBeenCalledWith("organizations")
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it("redirects to /protected when user is not a member of the organization", async () => {
      mockSingle.mockResolvedValue({ data: null })

      await expect(requireOrgMember(orgId)).rejects.toThrow(
        "NEXT_REDIRECT:/protected"
      )
      expect(mockRedirect).toHaveBeenCalledWith("/protected")
    })

    it("redirects to /protected when organization does not exist", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // Membership exists
          return Promise.resolve({ data: { role: "member" } })
        }
        // Organization doesn't exist
        return Promise.resolve({ data: null })
      })

      await expect(requireOrgMember(orgId)).rejects.toThrow(
        "NEXT_REDIRECT:/protected"
      )
      expect(mockRedirect).toHaveBeenCalledWith("/protected")
    })

    it("redirects to login when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      await expect(requireOrgMember(orgId)).rejects.toThrow(
        "NEXT_REDIRECT:/auth/login"
      )
      expect(mockRedirect).toHaveBeenCalledWith("/auth/login")
    })

    it("handles owner role correctly", async () => {
      const mockMembership = { role: "owner" }
      const mockOrganization = {
        name: "My Org",
        plan: "free",
        subscription_status: null,
      }

      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: mockMembership })
        }
        return Promise.resolve({ data: mockOrganization })
      })

      const result = await requireOrgMember(orgId)

      expect(result.membership.role).toBe("owner")
    })

    it("handles admin role correctly", async () => {
      const mockMembership = { role: "admin" }
      const mockOrganization = {
        name: "Admin Org",
        plan: "pro",
        subscription_status: "active",
      }

      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: mockMembership })
        }
        return Promise.resolve({ data: mockOrganization })
      })

      const result = await requireOrgMember(orgId)

      expect(result.membership.role).toBe("admin")
    })
  })
})
