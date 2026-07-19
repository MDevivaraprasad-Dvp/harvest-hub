import type { ReactNode } from 'react'

export function TabButton({
  active,
  onClick,
  label,
  icon,
  badge,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon?: ReactNode
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 font-bold tracking-tight transition-colors inline-flex items-center gap-2 ${
        active
          ? 'text-green-800 border-b-2 border-green-600'
          : 'text-gray-600 hover:text-green-700'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-1 inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-xs font-bold bg-green-600 text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  )
}
