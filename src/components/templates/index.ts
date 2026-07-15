import { lazy, type ComponentType } from 'react'
import type { Resume, Settings } from '../../types/resume'

export interface TemplateComponentProps {
  resume: Resume
  settings: Settings
}

export interface TemplateDefinition {
  id: Settings['templateId']
  name: string
  atsFriendly?: boolean
  component: ComponentType<TemplateComponentProps>
}

const LazyClassicTemplate = lazy(() =>
  import('./ClassicTemplate').then((module) => ({ default: module.ClassicTemplate })),
)
const LazyModernTemplate = lazy(() =>
  import('./ModernTemplate').then((module) => ({ default: module.ModernTemplate })),
)
const LazyMinimalTemplate = lazy(() =>
  import('./MinimalTemplate').then((module) => ({ default: module.MinimalTemplate })),
)

export const TEMPLATES: TemplateDefinition[] = [
  { id: 'classic', name: 'Classic', atsFriendly: true, component: LazyClassicTemplate },
  { id: 'modern', name: 'Modern', component: LazyModernTemplate },
  { id: 'minimal', name: 'Minimal', component: LazyMinimalTemplate },
]

export function getTemplateDefinition(id: Settings['templateId']): TemplateDefinition {
  return TEMPLATES.find((template) => template.id === id) ?? TEMPLATES[0]
}
