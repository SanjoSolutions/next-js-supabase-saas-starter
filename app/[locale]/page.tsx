import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LandingPage } from "@/components/landing-page"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  // Redirect logged-in users to protected area
  if (user) {
    redirect("/protected")
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-14 w-full border-b" />}>
        <Header />
      </Suspense>
      <div className="flex-1">
        <LandingPage />
      </div>
      <Footer />
    </main>
  )
}
