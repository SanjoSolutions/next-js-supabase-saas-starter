"use client"

import { setActiveOrganizationAction } from "@/app/[locale]/(authenticated)/organizations/actions"
import { FormCard } from "@/components/form-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslations } from "next-intl"

export function CreateOrganizationForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("organizations.create")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("organizations")
        .insert([{ name }])
        .select()
        .single()

      if (error) throw error

      if (data) {
        await setActiveOrganizationAction(data.id)
        router.push(`/organizations/${data.id}/welcome`)
      }

      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormCard title={t("title")} className={className} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              type="text"
              placeholder=""
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("loading") : t("submit")}
          </Button>
        </div>
      </form>
    </FormCard>
  )
}
