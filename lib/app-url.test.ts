import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getAppUrl } from "./app-url"

function resetEnv() {
  delete process.env.NEXT_PUBLIC_APP_URL
  delete process.env.VERCEL_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
}

describe("getAppUrl", () => {
  beforeEach(() => {
    resetEnv()
  })

  afterEach(() => {
    resetEnv()
  })

  it("prefers an explicit app url", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com/"
    process.env.VERCEL_URL = "preview.example.com"
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:55321"

    expect(getAppUrl()).toBe("https://app.example.com")
  })

  it("falls back to the vercel url", () => {
    process.env.VERCEL_URL = "preview.example.com"

    expect(getAppUrl()).toBe("https://preview.example.com")
  })

  it("derives the local app url from a non-default supabase port", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:55321"

    expect(getAppUrl()).toBe("http://127.0.0.1:3000")
  })

  it("falls back to localhost when no env is set", () => {
    expect(getAppUrl()).toBe("http://localhost:3000")
  })
})
