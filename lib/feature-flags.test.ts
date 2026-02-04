import { beforeEach, describe, expect, it, vi } from "vitest"
import { isFeatureEnabled } from "./feature-flags"

// Mock Supabase client
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockRpc = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}))

// Spy on console.error
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

describe("isFeatureEnabled", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default chain for from().select().eq().single()
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
  })

  describe("without organizationId", () => {
    it("returns default_value when feature exists", async () => {
      mockSingle.mockResolvedValue({ data: { default_value: true } })

      const result = await isFeatureEnabled("activity_dashboard")

      expect(result).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith("feature_flags")
      expect(mockSelect).toHaveBeenCalledWith("default_value")
      expect(mockEq).toHaveBeenCalledWith("name", "activity_dashboard")
      expect(mockRpc).not.toHaveBeenCalled()
    })

    it("returns false when default_value is false", async () => {
      mockSingle.mockResolvedValue({ data: { default_value: false } })

      const result = await isFeatureEnabled("disabled_feature")

      expect(result).toBe(false)
    })

    it("returns false when feature does not exist", async () => {
      mockSingle.mockResolvedValue({ data: null })

      const result = await isFeatureEnabled("nonexistent_feature")

      expect(result).toBe(false)
    })

    it("returns false when data is undefined", async () => {
      mockSingle.mockResolvedValue({ data: undefined })

      const result = await isFeatureEnabled("undefined_feature")

      expect(result).toBe(false)
    })
  })

  describe("with organizationId", () => {
    const orgId = "org-123"

    it("returns true when RPC returns true", async () => {
      mockRpc.mockResolvedValue({ data: true, error: null })

      const result = await isFeatureEnabled("activity_dashboard", orgId)

      expect(result).toBe(true)
      expect(mockRpc).toHaveBeenCalledWith("is_feature_enabled", {
        org_id: orgId,
        feature_name: "activity_dashboard",
      })
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it("returns false when RPC returns false", async () => {
      mockRpc.mockResolvedValue({ data: false, error: null })

      const result = await isFeatureEnabled("activity_dashboard", orgId)

      expect(result).toBe(false)
    })

    it("returns false when RPC returns null", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null })

      const result = await isFeatureEnabled("activity_dashboard", orgId)

      expect(result).toBe(false)
    })

    it("returns false and logs error when RPC fails", async () => {
      const mockError = { message: "RPC failed", code: "PGRST000" }
      mockRpc.mockResolvedValue({ data: null, error: mockError })

      const result = await isFeatureEnabled("activity_dashboard", orgId)

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error checking feature flag:",
        mockError
      )
    })

    it("handles different organization IDs correctly", async () => {
      mockRpc.mockResolvedValue({ data: true, error: null })

      await isFeatureEnabled("premium_feature", "org-456")

      expect(mockRpc).toHaveBeenCalledWith("is_feature_enabled", {
        org_id: "org-456",
        feature_name: "premium_feature",
      })
    })

    it("handles different feature names correctly", async () => {
      mockRpc.mockResolvedValue({ data: true, error: null })

      await isFeatureEnabled("custom_branding", orgId)

      expect(mockRpc).toHaveBeenCalledWith("is_feature_enabled", {
        org_id: orgId,
        feature_name: "custom_branding",
      })
    })

    it("converts truthy values to boolean true", async () => {
      mockRpc.mockResolvedValue({ data: 1, error: null })

      const result = await isFeatureEnabled("activity_dashboard", orgId)

      expect(result).toBe(true)
    })

    it("converts falsy values to boolean false", async () => {
      mockRpc.mockResolvedValue({ data: 0, error: null })

      const result = await isFeatureEnabled("activity_dashboard", orgId)

      expect(result).toBe(false)
    })
  })
})
