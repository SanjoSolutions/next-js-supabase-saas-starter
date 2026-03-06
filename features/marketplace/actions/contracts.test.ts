import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock requireUser
const mockRequireUser = vi.fn()
vi.mock("@/lib/auth", () => ({
  requireUser: () => mockRequireUser(),
}))

// Mock price utility
vi.mock("@/features/marketplace/lib/price", () => ({
  calculatePriceBreakdown: vi.fn().mockReturnValue({
    netCents: 10000,
    vatRate: 19,
    vatCents: 1900,
    grossCents: 11900,
    platformFeeCents: 1000,
    sellerPayoutCents: 9000,
  }),
}))

// Mock Supabase client with chainable builder
const mockSingle = vi.fn()
const mockRpc = vi.fn()

function createChain() {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.insert = vi.fn().mockReturnValue(chain)
  chain.update = vi.fn().mockReturnValue(chain)
  chain.in = vi.fn().mockReturnValue(chain)
  chain.limit = vi.fn().mockReturnValue(chain)
  chain.single = mockSingle
  return chain
}

const mockFrom = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}))

const { createContractFromMatch, updateContractStatus, getContractsForOrg } =
  await import("./contracts")

describe("marketplace contract actions", () => {
  const mockUser = { id: "user-123" }
  const buyerOrgId = "org-buyer"
  const sellerOrgId = "org-seller"

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireUser.mockResolvedValue(mockUser)
    mockFrom.mockReturnValue(createChain())
  })

  describe("createContractFromMatch", () => {
    it("throws when match not found", async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: "Not found" } })

      await expect(createContractFromMatch("match-1")).rejects.toThrow(
        "Confirmed match not found"
      )
    })

    it("throws when user is not a party to the match", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({
            data: {
              id: "match-1",
              agreed_price_cents: 10000,
              request_listing: { organization_id: buyerOrgId },
              offer_listing: { organization_id: sellerOrgId },
            },
            error: null,
          })
        }
        if (callCount === 2) {
          return Promise.resolve({ data: null })
        }
        return Promise.resolve({ data: null })
      })

      await expect(createContractFromMatch("match-1")).rejects.toThrow("Not authorized")
    })

    it("returns existing contract if already created", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({
            data: {
              id: "match-1",
              agreed_price_cents: 10000,
              request_listing: { organization_id: buyerOrgId },
              offer_listing: { organization_id: sellerOrgId },
            },
            error: null,
          })
        }
        if (callCount === 2) {
          return Promise.resolve({ data: { role: "member" } })
        }
        return Promise.resolve({ data: { id: "existing-contract" } })
      })

      const result = await createContractFromMatch("match-1")
      expect(result).toEqual({ id: "existing-contract" })
    })
  })

  describe("updateContractStatus", () => {
    it("throws when user is not a member", async () => {
      mockSingle.mockResolvedValueOnce({ data: null })

      await expect(
        updateContractStatus("contract-1", buyerOrgId, "completed")
      ).rejects.toThrow("Not a member of this organization")
    })

    it("throws when contract not found", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        return Promise.resolve({ data: null, error: { message: "Not found" } })
      })

      await expect(
        updateContractStatus("contract-1", buyerOrgId, "completed")
      ).rejects.toThrow("Contract not found")
    })

    it("throws on invalid status transition", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        return Promise.resolve({
          data: {
            id: "contract-1",
            status: "pending_payment",
            buyer_org_id: buyerOrgId,
            seller_org_id: sellerOrgId,
          },
          error: null,
        })
      })

      await expect(
        updateContractStatus("contract-1", buyerOrgId, "completed")
      ).rejects.toThrow("Invalid status transition")
    })

    it("throws when wrong role tries to update", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        return Promise.resolve({
          data: {
            id: "contract-1",
            status: "delivered",
            buyer_org_id: buyerOrgId,
            seller_org_id: sellerOrgId,
          },
          error: null,
        })
      })

      await expect(
        updateContractStatus("contract-1", sellerOrgId, "completed")
      ).rejects.toThrow("Only the buyer can perform this action")
    })

    it("allows seller to start work on paid contract", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        if (callCount === 2) {
          return Promise.resolve({
            data: {
              id: "contract-1",
              status: "paid",
              buyer_org_id: buyerOrgId,
              seller_org_id: sellerOrgId,
            },
            error: null,
          })
        }
        return Promise.resolve({
          data: { id: "contract-1", status: "in_progress" },
          error: null,
        })
      })

      const result = await updateContractStatus("contract-1", sellerOrgId, "in_progress")
      expect(result).toEqual({ id: "contract-1", status: "in_progress" })
    })

    it("allows buyer to confirm delivery", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        if (callCount === 2) {
          return Promise.resolve({
            data: {
              id: "contract-1",
              status: "delivered",
              buyer_org_id: buyerOrgId,
              seller_org_id: sellerOrgId,
            },
            error: null,
          })
        }
        return Promise.resolve({
          data: { id: "contract-1", status: "completed" },
          error: null,
        })
      })

      const result = await updateContractStatus("contract-1", buyerOrgId, "completed")
      expect(result).toEqual({ id: "contract-1", status: "completed" })
    })
  })

  describe("getContractsForOrg", () => {
    it("throws when user is not a member", async () => {
      mockSingle.mockResolvedValueOnce({ data: null })

      await expect(getContractsForOrg(buyerOrgId)).rejects.toThrow(
        "Not a member of this organization"
      )
    })

    it("returns contracts via RPC", async () => {
      mockSingle.mockResolvedValueOnce({ data: { role: "member" } })
      mockRpc.mockResolvedValue({
        data: [{ id: "contract-1" }, { id: "contract-2" }],
        error: null,
      })

      const result = await getContractsForOrg(buyerOrgId)
      expect(result).toEqual([{ id: "contract-1" }, { id: "contract-2" }])
    })
  })
})
