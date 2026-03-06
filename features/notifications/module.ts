import type { FeatureModuleDefinition } from "@/features/types"

export const notificationsFeatureModule = {
  key: "notifications",
  name: "Notifications",
  description:
    "In-app notification center with realtime updates and read-state actions.",
  ownedPaths: [
    "features/notifications",
    "app/[locale]/(authenticated)/notifications/actions.ts",
    "supabase/migrations/20260130200500_notifications.sql",
  ],
} satisfies FeatureModuleDefinition
