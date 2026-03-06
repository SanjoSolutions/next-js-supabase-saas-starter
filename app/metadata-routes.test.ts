import { afterEach, beforeEach, describe, expect, it } from "vitest"
import robots from "./robots"
import sitemap from "./sitemap"

function resetEnv() {
  delete process.env.NEXT_PUBLIC_APP_URL
  delete process.env.VERCEL_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
}

describe("metadata routes", () => {
  beforeEach(() => {
    resetEnv()
  })

  afterEach(() => {
    resetEnv()
  })

  it("uses NEXT_PUBLIC_APP_URL when building sitemap entries", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com/"

    const entries = sitemap()

    expect(entries[0]?.url).toBe("https://app.example.com/en")
    expect(entries.every((entry) => entry.url.startsWith("https://app.example.com/"))).toBe(true)
  })

  it("uses NEXT_PUBLIC_APP_URL for robots sitemap url", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com/"

    expect(robots().sitemap).toBe("https://app.example.com/sitemap.xml")
  })
})
