import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function LegalLayout({
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
        <div className="flex-1 flex flex-col max-w-3xl w-full px-5 pb-20">
          {children}
        </div>
        <Footer />
      </div>
    </main>
  )
}
