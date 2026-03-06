import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Validates Bearer token authentication for API routes.
 * Returns the authenticated user or a 401 response.
 */
export async function authenticateApiRequest(request: Request) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      ),
    }
  }

  const token = authHeader.replace("Bearer ", "")
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    }
  }

  return { user, error: null }
}

/**
 * Simple in-memory rate limiter for API routes.
 * For production, replace with Redis-backed rate limiting.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  key: string,
  maxRequests = 60,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  entry.count++

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: maxRequests - entry.count }
}

/**
 * Returns a 429 Too Many Requests response with Retry-After header.
 */
export function rateLimitResponse(retryAfterSeconds = 60) {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  )
}
