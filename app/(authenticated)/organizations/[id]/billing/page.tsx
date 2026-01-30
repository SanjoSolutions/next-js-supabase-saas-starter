import { createCheckoutSession, createCustomerPortalSession } from "@/actions/stripe"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { requireOrgMember } from "@/lib/auth"
import { Check } from "lucide-react"

export default async function BillingPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ success?: string, canceled?: string }>
}) {
  const { id } = await params
  const { success, canceled } = await searchParams
  
  const { organization: org } = await requireOrgMember(id)

  const isPro = org.plan === "pro" && org.subscription_status === "active"

  return (
    <div className="flex-1 flex flex-col gap-8 w-full">
      <h1 className="text-3xl font-bold">Billing & Plans</h1>
      
      {success && (
          <div className="bg-green-500/10 text-green-600 p-4 rounded-md">
              Payment successful! Your plan has been upgraded.
          </div>
      )}
      
      {canceled && (
          <div className="bg-yellow-500/10 text-yellow-600 p-4 rounded-md">
              Payment canceled. Not charged.
          </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className={!isPro ? "border-primary" : ""}>
              <CardHeader>
                  <CardTitle>Free Plan</CardTitle>
                  <CardDescription>good for getting started</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                  <div className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  <ul className="flex flex-col gap-2 text-sm">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Up to 5 members</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Basic features</li>
                  </ul>
              </CardContent>
              <CardFooter>
                  {isPro ? (
                     <Button variant="outline" disabled className="w-full">Included</Button>
                  ) : (
                     <Button variant="outline" disabled className="w-full">Current Plan</Button>
                  )}
              </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className={isPro ? "border-primary" : ""}>
              <CardHeader>
                  <CardTitle>Pro Plan</CardTitle>
                  <CardDescription>For growing teams</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                  <div className="text-3xl font-bold">$20<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  <ul className="flex flex-col gap-2 text-sm">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited members</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Advanced analytics</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Priority support</li>
                  </ul>
              </CardContent>
              <CardFooter>
                  {isPro ? (
                      <form action={createCustomerPortalSession.bind(null, id)} className="w-full">
                          <Button type="submit" variant="default" className="w-full">Manage Subscription</Button>
                      </form>
                  ) : (
                      <form action={createCheckoutSession.bind(null, id)} className="w-full">
                          <Button type="submit" className="w-full">Upgrade to Pro</Button>
                      </form>
                  )}
              </CardFooter>
          </Card>
      </div>
    </div>
  )
}
