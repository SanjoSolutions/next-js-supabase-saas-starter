import { updateSession } from "@/lib/supabase/proxy"
import createIntlMiddleware from "next-intl/middleware"
import { type NextRequest } from "next/server"
import { routing } from "@/i18n/routing"

const intlMiddleware = createIntlMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip i18n middleware for API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return await updateSession(request)
  }

  // Run i18n middleware first
  const intlResponse = intlMiddleware(request)

  // If i18n middleware returns a redirect, return it
  if (intlResponse.status !== 200) {
    return intlResponse
  }

  // Then run session update
  const sessionResponse = await updateSession(request)

  // Merge cookies from i18n response
  intlResponse.cookies.getAll().forEach((cookie) => {
    sessionResponse.cookies.set(cookie.name, cookie.value)
  })

  // Merge headers from i18n response (critical for locale resolution)
  intlResponse.headers.forEach((value, key) => {
    sessionResponse.headers.set(key, value)
  })

  return sessionResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
