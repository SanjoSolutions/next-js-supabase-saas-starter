export interface FeatureModuleDefinition {
  key: string
  flagName?: string
  name: string
  description: string
  ownedPaths: string[]
  routePrefixes?: string[]
}
