import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FormCardProps extends React.ComponentPropsWithoutRef<"div"> {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function FormCard({
  title,
  description,
  children,
  footer,
  className,
  ...props
}: FormCardProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {children}
          {footer}
        </CardContent>
      </Card>
    </div>
  )
}
