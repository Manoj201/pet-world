import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NotFound() {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Compass className="size-7 text-muted-foreground" />
      </div>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className={cn(buttonVariants(), 'mt-6')}>
        Back to home
      </Link>
    </div>
  )
}
