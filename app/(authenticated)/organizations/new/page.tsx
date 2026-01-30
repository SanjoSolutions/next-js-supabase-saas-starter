import { CreateOrganizationForm } from "@/components/create-organization-form"
import { requireUser } from "@/lib/auth"

export default async function Page() {
  await requireUser()
  
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <CreateOrganizationForm />
      </div>
    </div>
  )
}
