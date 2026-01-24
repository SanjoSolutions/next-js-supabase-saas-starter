import { CreateOrganizationForm } from "@/components/create-organization-form"
import { Header } from "@/components/header"
import { Suspense } from "react"

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Suspense fallback={<div className="h-16 w-full border-b" />}>
          <Header />
        </Suspense>
        <div className="flex-1 w-full flex flex-col gap-20 items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <CreateOrganizationForm />
          </div>
        </div>
      </div>
    </main>
  )
}
