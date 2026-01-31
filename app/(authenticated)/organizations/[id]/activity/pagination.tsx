"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface ActivityPaginationProps {
  currentPage: number
  hasMore: boolean
  total: number
  orgId: string
}

export function ActivityPagination({
  currentPage,
  hasMore,
  total,
  orgId,
}: ActivityPaginationProps) {
  const router = useRouter()
  const pageSize = 20
  const totalPages = Math.ceil(total / pageSize)

  const goToPage = (page: number) => {
    router.push(`/organizations/${orgId}/activity?page=${page}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t">
      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasMore}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
