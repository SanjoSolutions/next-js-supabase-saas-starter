import { describe, expect, it } from "vitest"
import { ENABLED_FEATURE_MODULES, isFeatureModuleEnabledInCode } from "./config"

describe("feature module config", () => {
  it("keeps marketplace disabled by default in code", () => {
    expect(ENABLED_FEATURE_MODULES).not.toContain("marketplace")
    expect(isFeatureModuleEnabledInCode("marketplace")).toBe(false)
  })
})
