import { Suspense } from "react"
import { ActivityDashboardContent } from "./content"

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { id } = await params
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || "1", 10)

  return (
    <Suspense
      fallback={
        <div className="w-full animate-pulse">
          <div className="h-48 bg-accent rounded-lg" />
        </div>
      }
    >
      <ActivityDashboardContent orgId={id} page={page} />
    </Suspense>
  )
}
