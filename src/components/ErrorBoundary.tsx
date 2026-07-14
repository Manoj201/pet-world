import { Component, type ErrorInfo, type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="size-7 text-destructive" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Please try refreshing the page. If the problem continues, contact us on WhatsApp.
          </p>
          <Button className="mt-6" onClick={() => window.location.assign('/')}>
            Back to home
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
