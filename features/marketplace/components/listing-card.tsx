"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatEurCents, calculateGross } from "@/features/marketplace/lib/price"
import { MapPin, Package, Calendar, ArrowRight } from "lucide-react"

interface ListingCardProps {
  listing: {
    id: string
    listing_type: string
    title: string
    status: string
    pickup_city: string
    pickup_postal_code: string
    delivery_city: string
    delivery_postal_code: string
    package_size: string
    price_cents: number
    price_min_cents?: number | null
    price_max_cents?: number | null
    delivery_date: string
    organizations?: { name: string } | null
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  const t = useTranslations("marketplace.listings")

  const minCents = listing.price_min_cents ?? listing.price_cents
  const maxCents = listing.price_max_cents ?? listing.price_cents
  const grossMin = calculateGross(minCents)
  const grossMax = calculateGross(maxCents)
  const orgName =
    listing.organizations && "name" in listing.organizations
      ? listing.organizations.name
      : null

  return (
    <Link href={`/marketplace/listings/${listing.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant={listing.listing_type === "request" ? "default" : "secondary"}>
              {t(`types.${listing.listing_type}`)}
            </Badge>
            <Badge variant="outline">{t(`status.${listing.status}`)}</Badge>
          </div>
          <CardTitle className="text-base mt-2">{listing.title}</CardTitle>
          {orgName && (
            <p className="text-xs text-muted-foreground">{orgName}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {listing.pickup_postal_code} {listing.pickup_city}
            </span>
            <ArrowRight className="h-3 w-3" />
            <span>
              {listing.delivery_postal_code} {listing.delivery_city}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              {t(`packageSizes.${listing.package_size}`)}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {listing.delivery_date}
            </span>
          </div>
          <div className="text-right font-bold">
            {grossMin !== grossMax
              ? `${formatEurCents(grossMin)} - ${formatEurCents(grossMax)}`
              : formatEurCents(grossMin)}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
