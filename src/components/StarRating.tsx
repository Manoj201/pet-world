import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
}

export function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const iconSize = size === 'sm' ? 'size-4' : 'size-6'
  const interactive = Boolean(onChange)

  return (
    <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          className={cn(interactive ? 'cursor-pointer' : 'cursor-default')}
        >
          <Star
            className={cn(
              iconSize,
              star <= value ? 'fill-accent text-accent' : 'fill-muted text-muted',
            )}
          />
        </button>
      ))}
    </div>
  )
}
