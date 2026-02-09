"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatEurCents, calculateGross } from "@/lib/marketplace/price"
import { ArrowRight, GitCompareArrows } from "lucide-react"

interface MatchCardProps {
  match: {
    id: string
    status: string
    agreed_price_cents: number
    request_listing: {
      title: string
      pickup_city: string
      delivery_city: string
      organizations?: { name: string } | null
    }
    offer_listing: {
      title: string
      pickup_city: string
      delivery_city: string
      organizations?: { name: string } | null
    }
  }
  activeOrgId: string
}

export function MatchCard({ match }: MatchCardProps) {
  const t = useTranslations("marketplace.matches")

  return (
    <Link href={`/marketplace/matches/${match.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCompareArrows className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t("matchFound")}</span>
            </div>
            <Badge variant="outline">{t(`status.${match.status}`)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium">{match.request_listing.title}</p>
              <p className="text-xs text-muted-foreground">
                {match.request_listing.organizations?.name}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{match.offer_listing.title}</p>
              <p className="text-xs text-muted-foreground">
                {match.offer_listing.organizations?.name}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">
                {formatEurCents(calculateGross(match.agreed_price_cents))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
