import type { Metadata } from "next"
import { getAppUrl } from "@/lib/app-url"

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
}

// Root layout - delegates to locale-specific layouts
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
