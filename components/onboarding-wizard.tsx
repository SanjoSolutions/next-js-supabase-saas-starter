"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"

interface OnboardingStep {
  id: string
  completed: boolean
}

interface OnboardingWizardProps {
  steps: OnboardingStep[]
  onCreateOrg: (name: string) => Promise<void>
  hasOrganization: boolean
}

export function OnboardingWizard({
  steps,
  onCreateOrg,
  hasOrganization,
}: OnboardingWizardProps) {
  const t = useTranslations("onboarding")
  const [orgName, setOrgName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const completedCount = steps.filter((s) => s.completed).length
  const progress = Math.round((completedCount / steps.length) * 100)

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim()) return
    setIsLoading(true)
    try {
      await onCreateOrg(orgName.trim())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {t("progress", { completed: completedCount, total: steps.length })}
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Step 1: Create account (always done if they see this) */}
          <StepItem
            title={t("steps.createAccount")}
            completed={true}
          />

          {/* Step 2: Create organization */}
          <StepItem
            title={t("steps.createOrg")}
            completed={hasOrganization}
          >
            {!hasOrganization && (
              <form onSubmit={handleCreateOrg} className="flex gap-2 mt-2">
                <Input
                  placeholder={t("orgPlaceholder")}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={isLoading || !orgName.trim()}>
                  {isLoading ? t("creating") : t("create")}
                </Button>
              </form>
            )}
          </StepItem>

          {/* Step 3: Invite team */}
          <StepItem
            title={t("steps.inviteTeam")}
            completed={steps.find((s) => s.id === "invite")?.completed ?? false}
            optional
          />

          {/* Step 4: Set up billing */}
          <StepItem
            title={t("steps.setupBilling")}
            completed={steps.find((s) => s.id === "billing")?.completed ?? false}
            optional
          />
        </div>
      </CardContent>
    </Card>
  )
}

function StepItem({
  title,
  completed,
  optional,
  children,
}: {
  title: string
  completed: boolean
  optional?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
          completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30"
        }`}
      >
        {completed && <Check className="h-3.5 w-3.5" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${completed ? "text-muted-foreground line-through" : ""}`}
          >
            {title}
          </span>
          {optional && (
            <span className="text-xs text-muted-foreground">(optional)</span>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
