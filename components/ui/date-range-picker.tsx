"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Calendar } from "@/registry/new-york-v4/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york-v4/ui/popover"
import { Label } from "@/registry/new-york-v4/ui/label"

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DateRangePickerProps {
  className?: string
  date: DateRange
  onDateChange: (date: DateRange) => void
  placeholder?: string
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
  placeholder = "Pick a date range",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const displayText = React.useMemo(() => {
    if (date?.from) {
      if (date.to) {
        return `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`
      }
      return format(date.from, "MMM d, yyyy")
    }
    return placeholder
  }, [date?.from, date?.to, placeholder])

  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      onDateChange(range)
      // Close popover when both dates are selected
      if (range.from && range.to) {
        setIsOpen(false)
      }
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <Label className="text-sm font-medium">Select date range</Label>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={(date) =>
              date > new Date() || date < new Date("2020-01-01")
            }
          />
          {date?.from && date?.to && (
            <div className="p-3 border-t">
              <div className="text-sm text-muted-foreground">
                Selected: {format(date.from, "MMM d, yyyy")} to {format(date.to, "MMM d, yyyy")}
                <br />
                Duration: {Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))} days
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}