"use client"

import * as React from "react"
import { addDays } from "date-fns"

import { Calendar } from "@/registry/new-york-v4/ui/calendar"
import { Card, CardContent } from "@/registry/new-york-v4/ui/card"

const start = new Date(2025, 5, 5)

export function CardsCalendar() {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent hydration issues by only rendering calendar after client mount
  if (!isMounted) {
    return (
      <Card className="hidden max-w-[260px] p-0 sm:flex">
        <CardContent className="p-0">
          <div className="h-[240px] w-full animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hidden max-w-[260px] p-0 sm:flex">
      <CardContent className="p-0">
        <Calendar
          numberOfMonths={1}
          mode="range"
          defaultMonth={start}
          selected={{
            from: start,
            to: addDays(start, 8),
          }}
        />
      </CardContent>
    </Card>
  )
}
