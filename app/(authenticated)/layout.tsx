import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Suspense } from "react"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Suspense fallback={<div className="h-16 w-full border-b" />}>
          <Header />
        </Suspense>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl w-full p-5">
          {children}
        </div>

        <Footer />
      </div>
    </main>
  )
}
