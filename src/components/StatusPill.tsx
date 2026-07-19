import type { ReactNode } from 'react'

type Variant = 'green' | 'blue' | 'amber' | 'purple' | 'gray' | 'red' | 'emerald'

const VARIANT_CLS: Record<Variant, { bg: string; text: string; dot: string }> = {
  green:   { bg: 'bg-green-100',   text: 'text-green-800',   dot: 'bg-green-500' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  blue:    { bg: 'bg-blue-100',    text: 'text-blue-800',    dot: 'bg-blue-500' },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-800',   dot: 'bg-amber-500' },
  purple:  { bg: 'bg-purple-100',  text: 'text-purple-800',  dot: 'bg-purple-500' },
  gray:    { bg: 'bg-gray-100',    text: 'text-gray-700',    dot: 'bg-gray-400' },
  red:     { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500' },
}

export function StatusPill({
  label,
  variant = 'green',
  dot = true,
  pulse = false,
  icon,
  size = 'md',
}: {
  label: string
  variant?: Variant
  dot?: boolean
  pulse?: boolean
  icon?: ReactNode
  size?: 'sm' | 'md'
}) {
  const v = VARIANT_CLS[variant]
  const sizeCls = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5'
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${v.bg} ${v.text} ${sizeCls}`}>
      {icon}
      {dot && !icon && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${v.dot}`} />}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${v.dot}`} />
        </span>
      )}
      <span>{label}</span>
    </span>
  )
}

export function NewPill({ label = 'NEW' }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-linear-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold tracking-wider px-1.5 py-0.5 shadow-sm">
      {label}
    </span>
  )
}
