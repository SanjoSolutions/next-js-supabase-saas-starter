import { Link } from "@/i18n/navigation"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getTranslations } from "next-intl/server"

export async function Footer() {
  const t = await getTranslations()

  return (
    <footer className="w-full flex items-center justify-between border-t mx-auto text-xs py-8 px-4 max-w-5xl">
      <nav className="flex gap-4">
        <Link
          href="/legal-notice"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("legal.impressum")}
        </Link>
        <Link
          href="/privacy-policy"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("legal.datenschutz")}
        </Link>
        <Link
          href="/terms"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("legal.agb")}
        </Link>
      </nav>
      <LanguageSwitcher />
    </footer>
  )
}
