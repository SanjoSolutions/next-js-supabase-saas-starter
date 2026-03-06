export interface FeatureModuleDefinition {
  key: string
  flagName: string
  name: string
  description: string
  defaultEnabled: boolean
  ownedPaths: string[]
  routePrefixes?: string[]
}
