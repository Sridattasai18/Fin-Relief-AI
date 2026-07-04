import { Loader2 } from 'lucide-react'

/**
 * Spinner — inline button spinner or standalone loading indicator
 * size: 'sm' (12), 'md' (16), 'lg' (24)
 */
const sizes = { sm: 12, md: 16, lg: 24 }

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <Loader2
      size={sizes[size] || sizes.md}
      className={`animate-spin text-[color:var(--color-muted)] ${className}`}
      aria-label="Loading"
    />
  )
}
