import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { MessageSquareHeart } from 'lucide-react'
import { averageRating, createReview, subscribeToApprovedReviews, type Review } from '@/services/reviews'
import { StarRating } from '@/components/StarRating'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function Reviews() {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reviews, setReviews] = useState<Review[] | null>(null)

  useEffect(() => subscribeToApprovedReviews(setReviews), [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (rating === 0) {
      toast.error('Please select a star rating')
      return
    }
    setSubmitting(true)
    try {
      await createReview({ name, rating, comment })
      setSubmitted(true)
    } catch {
      toast.error('Could not submit your review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60svh] flex-col items-center justify-center p-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <MessageSquareHeart className="size-7 text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Thanks for your feedback!</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Your review has been submitted and will appear on our homepage once it's been reviewed.
        </p>
        <Link to="/" className={cn(buttonVariants(), 'mt-6')}>
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <MessageSquareHeart className="size-6 text-primary" />
        </div>
        <h1 className="mt-3 text-xl font-semibold">Share your feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us how we're doing — your review may be featured on our homepage.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border bg-card p-5 shadow-sm"
      >
        <div className="grid gap-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="grid gap-1.5">
          <Label>Rating</Label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="comment">Your review</Label>
          <Textarea
            id="comment"
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit review'}
        </Button>
      </form>

      <div className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent reviews</h2>
          {reviews && reviews.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-semibold text-primary">
                {averageRating(reviews).average.toFixed(1)}
              </span>
              <StarRating value={Math.round(averageRating(reviews).average)} size="sm" />
              <span className="text-muted-foreground">({reviews.length})</span>
            </div>
          )}
        </div>

        {reviews === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No reviews yet — be the first to share your experience.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                <StarRating value={review.rating} size="sm" />
                <p className="mt-2 text-sm text-muted-foreground">"{review.comment}"</p>
                <p className="mt-2 text-sm font-medium">{review.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
