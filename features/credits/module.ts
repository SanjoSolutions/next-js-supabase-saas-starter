import type { FeatureModuleDefinition } from "@/features/types"

export const creditsFeatureModule = {
  key: "credits",
  name: "Credits",
  description: "Usage-based credit balances, transactions, and server actions.",
  ownedPaths: ["features/credits"],
} satisfies FeatureModuleDefinition
