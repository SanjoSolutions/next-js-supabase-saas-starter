import Link from "next/link"
import { ThemeSwitcher } from "@/components/theme-switcher"

export function Footer() {
  return (
    <footer className="w-full flex flex-wrap items-center justify-center border-t mx-auto text-center text-xs gap-x-8 gap-y-4 py-16 px-4">
      <p>
        Powered by{" "}
        <a
          href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
          target="_blank"
          className="font-bold hover:underline"
          rel="noreferrer"
        >
          Supabase
        </a>
      </p>
      <nav className="flex gap-4">
        <Link
          href="/impressum"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Impressum
        </Link>
        <Link
          href="/datenschutz"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Datenschutz
        </Link>
        <Link
          href="/agb"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          AGB
        </Link>
      </nav>
      <ThemeSwitcher />
    </footer>
  )
}
