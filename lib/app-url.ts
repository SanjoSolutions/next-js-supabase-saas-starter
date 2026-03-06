function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value
}

export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_APP_URL)
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
    url.port = "3000"
    url.pathname = ""
    url.search = ""
    url.hash = ""

    return trimTrailingSlash(url.toString())
  }

  return "http://localhost:3000"
}
