import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

// Mock Supabase SSR
const mockSingle = vi.fn()
const mockFrom = vi.fn()
const mockGetUser = vi.fn()

function createChain() {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.insert = vi.fn().mockReturnValue(chain)
  chain.single = mockSingle
  return chain
}

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn().mockImplementation(() => ({
    from: mockFrom,
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

const { POST } = await import("./route")

describe("POST /api/marketplace/listings", () => {
  const validBody = {
    organizationId: "org-123",
    listingType: "request",
    title: "Test Listing",
    priceMinCents: 10000,
    priceMaxCents: 15000,
    pickupStreet: "Main St 1",
    pickupPostalCode: "10115",
    pickupCity: "Berlin",
    deliveryStreet: "Market Sq 1",
    deliveryPostalCode: "80331",
    deliveryCity: "Munich",
    packageSize: "medium",
    deliveryDate: "2026-03-01",
    expiresAt: "2026-02-28T23:59:59Z",
  }

  function makeRequest(body: unknown, token = "valid-token") {
    return new NextRequest("http://localhost:3000/api/marketplace/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue(createChain())
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    })
  })

  it("returns 401 without Authorization header", async () => {
    const req = new NextRequest("http://localhost:3000/api/marketplace/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it("returns 401 with invalid token", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid token" },
    })

    const res = await POST(makeRequest(validBody, "bad-token"))
    expect(res.status).toBe(401)
  })

  it("returns 400 with missing required fields", async () => {
    const res = await POST(makeRequest({ organizationId: "org-123" }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain("Missing required fields")
  })

  it("returns 400 when priceMinCents exceeds priceMaxCents", async () => {
    const res = await POST(makeRequest({ ...validBody, priceMinCents: 20000, priceMaxCents: 10000 }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain("priceMinCents must not exceed priceMaxCents")
  })

  it("returns 400 with invalid listingType", async () => {
    const res = await POST(makeRequest({ ...validBody, listingType: "invalid" }))
    expect(res.status).toBe(400)
  })

  it("returns 400 with invalid packageSize", async () => {
    const res = await POST(makeRequest({ ...validBody, packageSize: "huge" }))
    expect(res.status).toBe(400)
  })

  it("returns 403 when not a member", async () => {
    mockSingle.mockResolvedValueOnce({ data: null })

    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(403)
  })

  it("returns 403 when marketplace profile not found", async () => {
    let callCount = 0
    mockSingle.mockImplementation(() => {
      callCount++
      if (callCount === 1) return Promise.resolve({ data: { role: "member" } })
      return Promise.resolve({ data: null })
    })

    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(403)
  })

  it("returns 201 on successful creation", async () => {
    let callCount = 0
    mockSingle.mockImplementation(() => {
      callCount++
      if (callCount === 1) return Promise.resolve({ data: { role: "member" } })
      if (callCount === 2) {
        return Promise.resolve({
          data: { marketplace_role: "buyer", stripe_connect_onboarded: false },
        })
      }
      return Promise.resolve({
        data: { id: "listing-1", title: "Test Listing" },
        error: null,
      })
    })

    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.id).toBe("listing-1")
  })
})
