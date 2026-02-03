import { createClient } from "@/lib/supabase/server"
import { Link } from "@/i18n/navigation"
import { LogoutButton } from "./logout-button"
import { Button } from "./ui/button"
import { getTranslations } from "next-intl/server"

export async function AuthButton() {
  const t = await getTranslations("auth.button")
  const supabase = await createClient()

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims()

  const user = data?.claims

  return user ? (
    <div className="flex items-center gap-4">
      {t("greeting")} {user.user_metadata?.first_name || user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">{t("signIn")}</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">{t("signUp")}</Link>
      </Button>
    </div>
  )
}
