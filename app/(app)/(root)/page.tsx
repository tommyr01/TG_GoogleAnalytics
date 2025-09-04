"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function IndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/analytics")
  }, [router])

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="size-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to analytics...</p>
      </div>
    </div>
  )
}