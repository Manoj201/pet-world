import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/StarRating'
import {
  deleteReview,
  setReviewApproved,
  subscribeToAllReviews,
  type Review,
} from '@/services/reviews'
import { cn } from '@/lib/utils'

function formatReviewDate(createdAt: Review['createdAt']) {
  if (!createdAt) return ''
  return createdAt.toDate().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => subscribeToAllReviews(setReviews), [])

  const pending = useMemo(() => reviews.filter((r) => !r.approved), [reviews])
  const approved = useMemo(() => reviews.filter((r) => r.approved), [reviews])

  async function handleApprove(review: Review) {
    try {
      await setReviewApproved(review.id, true)
      toast.success('Review approved')
    } catch {
      toast.error('Failed to approve review')
    }
  }

  async function handleUnapprove(review: Review) {
    try {
      await setReviewApproved(review.id, false)
    } catch {
      toast.error('Failed to update review')
    }
  }

  async function handleDelete(review: Review) {
    if (!confirm(`Delete this review by ${review.name}? This cannot be undone.`)) return
    try {
      await deleteReview(review.id)
      toast.success('Review deleted')
    } catch {
      toast.error('Failed to delete review')
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-medium">Reviews</h1>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Pending approval ({pending.length})
        </h2>
        {pending.length === 0 && <p className="text-sm text-muted-foreground">Nothing to review.</p>}
        <div className="space-y-3">
          {pending.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-accent/40 bg-accent/5 p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <StarRating value={review.rating} size="sm" />
                  <p className="mt-2 text-sm">{review.comment}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {review.name} · {formatReviewDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1.5" onClick={() => handleApprove(review)}>
                    <Check className="size-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(review)}
                    aria-label="Delete review"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Live on homepage ({approved.length})
        </h2>
        {approved.length === 0 && (
          <p className="text-sm text-muted-foreground">No approved reviews yet.</p>
        )}
        <div className="space-y-3">
          {approved.map((review) => (
            <div key={review.id} className={cn('rounded-2xl border bg-card p-5 shadow-sm')}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <StarRating value={review.rating} size="sm" />
                  <p className="mt-2 text-sm">{review.comment}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {review.name} · {formatReviewDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleUnapprove(review)}>
                    Unpublish
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(review)}
                    aria-label="Delete review"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
