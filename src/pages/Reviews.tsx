import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { MessageSquareHeart } from 'lucide-react'
import { createReview } from '@/services/reviews'
import { StarRating } from '@/components/StarRating'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export function Reviews() {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
    </div>
  )
}
