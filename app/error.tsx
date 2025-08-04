'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {error.message || 'An unexpected error occurred while loading this page.'}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}