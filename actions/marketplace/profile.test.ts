import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock requireUser
const mockRequireUser = vi.fn()
vi.mock("@/lib/auth", () => ({
  requireUser: () => mockRequireUser(),
}))

// Mock Supabase client with a chainable builder
const mockSingle = vi.fn()

function createChain() {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.insert = vi.fn().mockReturnValue(chain)
  chain.update = vi.fn().mockReturnValue(chain)
  chain.single = mockSingle
  return chain
}

const mockFrom = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: mockFrom,
  })),
}))

const { createMarketplaceProfile, updateMarketplaceProfile, getMarketplaceProfile } =
  await import("./profile")

describe("marketplace profile actions", () => {
  const mockUser = { id: "user-123", email: "test@example.com" }
  const orgId = "org-456"

  const validInput = {
    organizationId: orgId,
    marketplaceRole: "buyer" as const,
    businessType: "company" as const,
    companyName: "Test GmbH",
    streetAddress: "Hauptstr. 1",
    postalCode: "10115",
    city: "Berlin",
    contactEmail: "contact@test.de",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireUser.mockResolvedValue(mockUser)
    mockFrom.mockReturnValue(createChain())
  })

  describe("createMarketplaceProfile", () => {
    it("throws when user is not owner or admin", async () => {
      mockSingle.mockResolvedValueOnce({ data: { role: "member" } })

      await expect(createMarketplaceProfile(validInput)).rejects.toThrow(
        "Only owners or admins can create a marketplace profile"
      )
    })

    it("throws when user has no membership", async () => {
      mockSingle.mockResolvedValueOnce({ data: null })

      await expect(createMarketplaceProfile(validInput)).rejects.toThrow(
        "Only owners or admins can create a marketplace profile"
      )
    })

    it("throws when profile already exists", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "owner" } })
        }
        return Promise.resolve({ data: { id: "existing-profile" } })
      })

      await expect(createMarketplaceProfile(validInput)).rejects.toThrow(
        "Marketplace profile already exists for this organization"
      )
    })

    it("creates profile when user is owner and no existing profile", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "owner" } })
        }
        if (callCount === 2) {
          return Promise.resolve({ data: null })
        }
        return Promise.resolve({
          data: { id: "new-profile", organization_id: orgId },
          error: null,
        })
      })

      const result = await createMarketplaceProfile(validInput)
      expect(result).toEqual({ id: "new-profile", organization_id: orgId })
    })

    it("creates profile when user is admin", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "admin" } })
        }
        if (callCount === 2) {
          return Promise.resolve({ data: null })
        }
        return Promise.resolve({
          data: { id: "new-profile" },
          error: null,
        })
      })

      const result = await createMarketplaceProfile(validInput)
      expect(result).toEqual({ id: "new-profile" })
    })
  })

  describe("updateMarketplaceProfile", () => {
    it("throws when user is not owner or admin", async () => {
      mockSingle.mockResolvedValueOnce({ data: { role: "member" } })

      await expect(
        updateMarketplaceProfile({ organizationId: orgId, companyName: "New Name" })
      ).rejects.toThrow("Only owners or admins can update the marketplace profile")
    })

    it("updates profile when user is owner", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "owner" } })
        }
        return Promise.resolve({
          data: { id: "profile-1", company_name: "New Name" },
          error: null,
        })
      })

      const result = await updateMarketplaceProfile({
        organizationId: orgId,
        companyName: "New Name",
      })
      expect(result).toEqual({ id: "profile-1", company_name: "New Name" })
    })
  })

  describe("getMarketplaceProfile", () => {
    it("returns profile when found", async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: "profile-1", organization_id: orgId },
        error: null,
      })

      const result = await getMarketplaceProfile(orgId)
      expect(result).toEqual({ id: "profile-1", organization_id: orgId })
    })

    it("returns null when not found (PGRST116)", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      })

      const result = await getMarketplaceProfile(orgId)
      expect(result).toBeNull()
    })

    it("throws on other errors", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST500", message: "Internal error" },
      })

      await expect(getMarketplaceProfile(orgId)).rejects.toThrow("Internal error")
    })
  })
})
