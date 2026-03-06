import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock requireUser
const mockRequireUser = vi.fn()
vi.mock("@/lib/auth", () => ({
  requireUser: () => mockRequireUser(),
}))

// Mock Stripe
const mockPaymentIntentsCreate = vi.fn()
vi.mock("@/lib/stripe", () => ({
  stripe: {
    paymentIntents: {
      create: (...args: unknown[]) => mockPaymentIntentsCreate(...args),
    },
  },
}))

// Mock Supabase client with chainable builder
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

const { createPaymentForContract } = await import("./payments")

describe("marketplace payment actions", () => {
  const mockUser = { id: "user-123" }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireUser.mockResolvedValue(mockUser)
    mockFrom.mockReturnValue(createChain())
  })

  it("throws when contract not found or not pending", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: "Not found" } })

    await expect(createPaymentForContract("contract-1")).rejects.toThrow(
      "Contract not found or not pending payment"
    )
  })

  it("throws when user is not the buyer", async () => {
    let callCount = 0
    mockSingle.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          data: {
            id: "contract-1",
            buyer_org_id: "buyer-org",
            seller_org_id: "seller-org",
            gross_price_cents: 11900,
            platform_fee_cents: 1000,
            invoice_number: "INV-2026-000001",
          },
          error: null,
        })
      }
      return Promise.resolve({ data: null })
    })

    await expect(createPaymentForContract("contract-1")).rejects.toThrow(
      "Only the buyer can initiate payment"
    )
  })

  it("throws when seller has no Stripe Connect account", async () => {
    let callCount = 0
    mockSingle.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          data: {
            id: "contract-1",
            buyer_org_id: "buyer-org",
            seller_org_id: "seller-org",
            gross_price_cents: 11900,
            platform_fee_cents: 1000,
            invoice_number: "INV-2026-000001",
          },
          error: null,
        })
      }
      if (callCount === 2) {
        return Promise.resolve({ data: { role: "member" } })
      }
      return Promise.resolve({
        data: { stripe_connect_account_id: null },
      })
    })

    await expect(createPaymentForContract("contract-1")).rejects.toThrow(
      "Seller has no Stripe Connect account"
    )
  })

  it("creates PaymentIntent with destination charge", async () => {
    let callCount = 0
    mockSingle.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          data: {
            id: "contract-1",
            buyer_org_id: "buyer-org",
            seller_org_id: "seller-org",
            gross_price_cents: 11900,
            platform_fee_cents: 1000,
            invoice_number: "INV-2026-000001",
          },
          error: null,
        })
      }
      if (callCount === 2) {
        return Promise.resolve({ data: { role: "member" } })
      }
      return Promise.resolve({
        data: { stripe_connect_account_id: "acct_seller123" },
      })
    })

    mockPaymentIntentsCreate.mockResolvedValue({
      id: "pi_test123",
      client_secret: "pi_test123_secret_abc",
    })

    const result = await createPaymentForContract("contract-1")

    expect(result).toEqual({
      clientSecret: "pi_test123_secret_abc",
      paymentIntentId: "pi_test123",
    })

    expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 11900,
        currency: "eur",
        application_fee_amount: 1000,
        transfer_data: { destination: "acct_seller123" },
        metadata: expect.objectContaining({
          contract_id: "contract-1",
          buyer_org_id: "buyer-org",
          seller_org_id: "seller-org",
        }),
      })
    )
  })
})
