import { requireUser } from "@/lib/auth"
import { requireMarketplaceAccess } from "@/features/marketplace/access"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MarketplaceNav } from "@/components/marketplace/marketplace-nav"
import { getContractsForOrg } from "@/actions/marketplace/contracts"
import { formatEurCents } from "@/lib/marketplace/price"

interface ContractRow {
  id: string
  tracking_code: string
  counterparty_name: string
  is_buyer: boolean
  gross_price_cents: number
  status: string
}

export default async function ContractsPage() {
  const t = await getTranslations("marketplace.contracts")
  await requireUser()
  const cookieStore = await cookies()
  const activeOrgId = await requireMarketplaceAccess(
    cookieStore.get("active_org_id")?.value
  )

  const contracts = await getContractsForOrg(activeOrgId)

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <MarketplaceNav />

      {contracts && contracts.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("tracking")}</TableHead>
              <TableHead>{t("counterparty")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("amount")}</TableHead>
              <TableHead>{t("statusLabel")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(contracts as ContractRow[]).map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>
                  <Link
                    href={`/marketplace/contracts/${contract.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {contract.tracking_code}
                  </Link>
                </TableCell>
                <TableCell>{contract.counterparty_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {contract.is_buyer ? t("buyer") : t("seller")}
                  </Badge>
                </TableCell>
                <TableCell>{formatEurCents(contract.gross_price_cents)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{t(`status.${contract.status}`)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {t("empty")}
        </div>
      )}
    </div>
  )
}
