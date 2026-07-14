import { CheckCircle2, CircleX, Clock, PackageCheck, Truck, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'pending', label: 'Order placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck },
]

export function OrderProgressStepper({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
        <CircleX className="size-5" />
        This order was cancelled.
      </div>
    )
  }

  const currentIndex = STEPS.findIndex((step) => step.key === status)

  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => {
        const isComplete = i <= currentIndex
        const Icon = step.icon
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center last:flex-none">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full',
                  isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="size-4" />
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('h-0.5 flex-1', isComplete ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
            <p
              className={cn(
                'mt-1.5 text-center text-xs',
                isComplete ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}
