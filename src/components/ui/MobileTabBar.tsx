import { Eye, Pencil, type LucideIcon } from 'lucide-react'

export type MobileView = 'edit' | 'preview'

interface MobileTabBarProps {
  active: MobileView
  onChange: (view: MobileView) => void
}

export function MobileTabBar({ active, onChange }: MobileTabBarProps) {
  return (
    <nav
      className="flex h-14 shrink-0 border-t border-line bg-surface md:hidden"
      aria-label="Editor view"
    >
      <TabButton
        icon={Pencil}
        label="Edit"
        isActive={active === 'edit'}
        onClick={() => onChange('edit')}
      />
      <TabButton
        icon={Eye}
        label="Preview"
        isActive={active === 'preview'}
        onClick={() => onChange('preview')}
      />
    </nav>
  )
}

interface TabButtonProps {
  icon: LucideIcon
  label: string
  isActive: boolean
  onClick: () => void
}

function TabButton({ icon: Icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
        isActive ? 'text-action' : 'text-muted'
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {label}
    </button>
  )
}
