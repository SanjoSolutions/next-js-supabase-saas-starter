import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock environment variables before importing the module
vi.stubEnv("NEXT_PUBLIC_STRIPE_PRICE_ID", "price_test123")
vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321")

// Must import after stubbing env
const { createCheckoutSession, createCustomerPortalSession } = await import("./stripe")

// Mock the redirect function from next/navigation
const mockRedirect = vi.fn()
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url)
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))

// Mock Stripe
const mockCheckoutSessionsCreate = vi.fn()
const mockBillingPortalSessionsCreate = vi.fn()
vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: (...args: unknown[]) => mockCheckoutSessionsCreate(...args),
      },
    },
    billingPortal: {
      sessions: {
        create: (...args: unknown[]) => mockBillingPortalSessionsCreate(...args),
      },
    },
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

// Spy on console.error
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

describe("stripe actions", () => {
  const mockUser = { id: "user-123", email: "test@example.com" }
  const orgId = "org-456"

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default Supabase chain
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle })

    // Default: user is authenticated
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
  })

  describe("createCheckoutSession", () => {
    it("throws error when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      await expect(createCheckoutSession(orgId)).rejects.toThrow("Unauthorized")
    })

    it("throws error when user is not a member of the organization", async () => {
      mockSingle.mockResolvedValue({ data: null })

      await expect(createCheckoutSession(orgId)).rejects.toThrow(
        "Only owners or admins can manage billing"
      )
    })

    it("throws error when user is a regular member (not owner or admin)", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        return Promise.resolve({ data: { stripe_customer_id: null } })
      })

      await expect(createCheckoutSession(orgId)).rejects.toThrow(
        "Only owners or admins can manage billing"
      )
    })

    it("allows owner to create checkout session", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "owner" } })
        }
        return Promise.resolve({ data: { stripe_customer_id: "cus_existing" } })
      })

      mockCheckoutSessionsCreate.mockResolvedValue({
        url: "https://checkout.stripe.com/session123",
      })

      await expect(createCheckoutSession(orgId)).rejects.toThrow(
        "NEXT_REDIRECT:https://checkout.stripe.com/session123"
      )

      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "subscription",
          payment_method_types: ["card"],
          customer: "cus_existing",
          metadata: { orgId },
        })
      )
    })

    it("allows admin to create checkout session", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "admin" } })
        }
        return Promise.resolve({ data: { stripe_customer_id: null } })
      })

      mockCheckoutSessionsCreate.mockResolvedValue({
        url: "https://checkout.stripe.com/session456",
      })

      await expect(createCheckoutSession(orgId)).rejects.toThrow(
        "NEXT_REDIRECT:https://checkout.stripe.com/session456"
      )

      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_email: mockUser.email,
        })
      )
    })

    it("uses customer email when no stripe_customer_id exists", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "owner" } })
        }
        return Promise.resolve({ data: { stripe_customer_id: null } })
      })

      mockCheckoutSessionsCreate.mockResolvedValue({
        url: "https://checkout.stripe.com/new",
      })

      await expect(createCheckoutSession(orgId)).rejects.toThrow("NEXT_REDIRECT")

      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: undefined,
          customer_email: mockUser.email,
        })
      )
    })

    it("logs and rethrows Stripe errors", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "owner" } })
        }
        return Promise.resolve({ data: { stripe_customer_id: "cus_123" } })
      })

      const stripeError = new Error("Stripe API error")
      mockCheckoutSessionsCreate.mockRejectedValue(stripeError)

      await expect(createCheckoutSession(orgId)).rejects.toThrow("Stripe API error")
      expect(consoleErrorSpy).toHaveBeenCalledWith("Stripe Checkout Error:", stripeError)
    })
  })

  describe("createCustomerPortalSession", () => {
    it("throws error when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      await expect(createCustomerPortalSession(orgId)).rejects.toThrow("Unauthorized")
    })

    it("throws error when user is not a member of the organization", async () => {
      mockSingle.mockResolvedValue({ data: null })

      await expect(createCustomerPortalSession(orgId)).rejects.toThrow(
        "Only owners or admins can manage billing"
      )
    })

    it("throws error when user is a regular member", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "member" } })
        }
        return Promise.resolve({ data: { stripe_customer_id: "cus_123" } })
      })

      await expect(createCustomerPortalSession(orgId)).rejects.toThrow(
        "Only owners or admins can manage billing"
      )
    })

    it("throws error when no billing account exists", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "owner" } })
        }
        return Promise.resolve({ data: { stripe_customer_id: null } })
      })

      await expect(createCustomerPortalSession(orgId)).rejects.toThrow(
        "No billing account found"
      )
    })

    it("allows owner to access customer portal", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "owner" } })
        }
        return Promise.resolve({ data: { stripe_customer_id: "cus_existing" } })
      })

      mockBillingPortalSessionsCreate.mockResolvedValue({
        url: "https://billing.stripe.com/portal123",
      })

      await expect(createCustomerPortalSession(orgId)).rejects.toThrow(
        "NEXT_REDIRECT:https://billing.stripe.com/portal123"
      )

      expect(mockBillingPortalSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: "cus_existing",
        })
      )
    })

    it("allows admin to access customer portal", async () => {
      let callCount = 0
      mockSingle.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { role: "admin" } })
        }
        return Promise.resolve({ data: { stripe_customer_id: "cus_admin" } })
      })

      mockBillingPortalSessionsCreate.mockResolvedValue({
        url: "https://billing.stripe.com/admin-portal",
      })

      await expect(createCustomerPortalSession(orgId)).rejects.toThrow(
        "NEXT_REDIRECT:https://billing.stripe.com/admin-portal"
      )
    })
  })
})
