import { describe, expect, it } from "vitest"
import { FEATURE_MODULE_STATE, isFeatureModuleEnabledInCode } from "./config"

describe("feature module config", () => {
  it("keeps marketplace disabled by default in code", () => {
    expect(FEATURE_MODULE_STATE.marketplace).toBe(false)
    expect(isFeatureModuleEnabledInCode("marketplace")).toBe(false)
  })

  it("keeps cookie consent enabled in code by default", () => {
    expect(isFeatureModuleEnabledInCode("cookieConsent")).toBe(true)
  })

  it("keeps the rest of the optional feature modules enabled in code by default", () => {
    expect(FEATURE_MODULE_STATE.admin).toBe(true)
    expect(FEATURE_MODULE_STATE.activityDashboard).toBe(true)
    expect(FEATURE_MODULE_STATE.credits).toBe(true)
    expect(FEATURE_MODULE_STATE.notifications).toBe(true)

    expect(isFeatureModuleEnabledInCode("admin")).toBe(true)
    expect(isFeatureModuleEnabledInCode("activityDashboard")).toBe(true)
    expect(isFeatureModuleEnabledInCode("credits")).toBe(true)
    expect(isFeatureModuleEnabledInCode("notifications")).toBe(true)
  })
})
