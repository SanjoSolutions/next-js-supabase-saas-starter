import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock requireUser
const mockRequireUser = vi.fn()
vi.mock("@/lib/auth", () => ({
  requireUser: () => mockRequireUser(),
}))

// Mock Supabase client with chainable builder
const mockSingle = vi.fn()
const mockQueryResult = vi.fn()

function createChain() {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.insert = vi.fn().mockReturnValue(chain)
  chain.update = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockReturnValue(chain)
  chain.limit = vi.fn().mockReturnValue(chain)
  chain.range = vi.fn().mockReturnValue(chain)
  chain.in = vi.fn().mockReturnValue(chain)
  chain.single = mockSingle
  // For queries that don't call .single() (like getListings)
  chain.then = undefined
  Object.defineProperty(chain, "data", { get: () => mockQueryResult().data })
  Object.defineProperty(chain, "error", { get: () => mockQueryResult().error })
  return chain
}

const mockFrom = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: mockFrom,
  })),
}))

const { createListing, cancelListing, getMyListings } =
  await import("./listings")

describe("marketplace listing actions", () => {
  const mockUser = { id: "user-123", email: "test@example.com" }
  const orgId = "org-456"

  const validListingInput = {
    organizationId: orgId,
    listingType: "request" as const,
    title: "Deliver 5 boxes Berlin to Munich",
    pickupStreet: "Hauptstr. 1",
    pickupPostalCode: "10115",
    pickupCity: "Berlin",
    deliveryStreet: "Marienplatz 1",
    deliveryPostalCode: "80331",
    deliveryCity: "Munich",
    packageSize: "medium" as const,
    priceMinCents: 12000,
    priceMaxCents: 18000,
    deliveryDate: "2026-03-01",
    expiresAt: "2026-02-28T23:59:59Z",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireUser.mockResolvedValue(mockUser)
    mockFrom.mockReturnValue(createChain())
    mockQueryResult.mockReturnValue({ data: [], error: null })
  })

  describe("createListing", () => {
    it("throws when user is not a member", async () => {
      mockSingle.mockResolvedValueOnce({ data: null })

      await expect(createListing(validListingInput)).rejects.toThrow(
        "Not a member of this organization"
      )
    })

    it("throws when marketplace profile not found", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        return Promise.resolve({ data: null })
      })

      await expect(createListing(validListingInput)).rejects.toThrow(
        "Marketplace profile not found"
      )
    })

    it("throws when seller tries to create request", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        return Promise.resolve({
          data: { marketplace_role: "seller", stripe_connect_onboarded: true },
        })
      })

      await expect(
        createListing({ ...validListingInput, listingType: "request" })
      ).rejects.toThrow("Sellers cannot create delivery requests")
    })

    it("throws when buyer tries to create offer", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        return Promise.resolve({
          data: { marketplace_role: "buyer", stripe_connect_onboarded: false },
        })
      })

      await expect(
        createListing({ ...validListingInput, listingType: "offer" })
      ).rejects.toThrow("Buyers cannot create delivery offers")
    })

    it("throws when seller offers without Stripe Connect", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        return Promise.resolve({
          data: { marketplace_role: "seller", stripe_connect_onboarded: false },
        })
      })

      await expect(
        createListing({ ...validListingInput, listingType: "offer" })
      ).rejects.toThrow("Stripe Connect onboarding required to post offers")
    })

    it("creates listing for buyer creating request", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        if (callCount === 2) {
          return Promise.resolve({
            data: { marketplace_role: "buyer", stripe_connect_onboarded: false },
          })
        }
        return Promise.resolve({
          data: { id: "listing-1", title: validListingInput.title },
          error: null,
        })
      })

      const result = await createListing(validListingInput)
      expect(result).toEqual({ id: "listing-1", title: validListingInput.title })
    })

    it("throws when priceMinCents exceeds priceMaxCents", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        return Promise.resolve({
          data: { marketplace_role: "buyer", stripe_connect_onboarded: false },
        })
      })

      await expect(
        createListing({ ...validListingInput, priceMinCents: 20000, priceMaxCents: 10000 })
      ).rejects.toThrow("Minimum price must not exceed maximum price")
    })

    it("creates listing for 'both' role creating offer with Stripe", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        if (callCount === 2) {
          return Promise.resolve({
            data: { marketplace_role: "both", stripe_connect_onboarded: true },
          })
        }
        return Promise.resolve({
          data: { id: "listing-2", listing_type: "offer" },
          error: null,
        })
      })

      const result = await createListing({ ...validListingInput, listingType: "offer" })
      expect(result).toEqual({ id: "listing-2", listing_type: "offer" })
    })
  })

  describe("cancelListing", () => {
    it("throws when user is not a member", async () => {
      mockSingle.mockResolvedValueOnce({ data: null })

      await expect(cancelListing("listing-1", orgId)).rejects.toThrow(
        "Not a member of this organization"
      )
    })

    it("cancels an open listing", async () => {
      mockSingle.mockResolvedValueOnce({ data: { role: "member" } })

      // cancelListing doesn't call .single() for the update, it just checks .error
      // The chain returns { error: null } via mockQueryResult
      await expect(cancelListing("listing-1", orgId)).resolves.toBeUndefined()
    })
  })

  describe("getMyListings", () => {
    it("throws when user is not a member", async () => {
      mockSingle.mockResolvedValueOnce({ data: null })

      await expect(getMyListings(orgId)).rejects.toThrow(
        "Not a member of this organization"
      )
    })
  })
})
