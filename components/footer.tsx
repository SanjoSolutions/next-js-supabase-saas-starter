import { Link } from "@/i18n/navigation"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getTranslations } from "next-intl/server"

export async function Footer() {
  const t = await getTranslations()

  return (
    <footer className="w-full flex flex-wrap items-center justify-center border-t mx-auto text-center text-xs gap-x-8 gap-y-4 py-16 px-4">
      <p>
        {t("common.poweredBy")}{" "}
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
          {t("legal.impressum")}
        </Link>
        <Link
          href="/datenschutz"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("legal.datenschutz")}
        </Link>
        <Link
          href="/agb"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("legal.agb")}
        </Link>
      </nav>
      <LanguageSwitcher />
      <ThemeSwitcher />
    </footer>
  )
}
