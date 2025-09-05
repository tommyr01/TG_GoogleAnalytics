"use client"

import { useState } from "react"
import { CalendarDays } from "lucide-react"
import { Button } from "@/registry/new-york-v4/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/new-york-v4/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/new-york-v4/ui/dialog"
import { format } from "date-fns"
import { useDateRange, type DateRangeOption } from "@/contexts/date-range-context"
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker"

interface AnalyticsHeaderProps {
  title: string
  description?: string
}

export function AnalyticsHeader({ title, description }: AnalyticsHeaderProps) {
  const { setSelectedRange, customRange, setCustomRange, getDisplayLabel } = useDateRange()
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false)
  const [tempDateRange, setTempDateRange] = useState<DateRange>({
    from: customRange ? new Date(customRange.startDate) : undefined,
    to: customRange ? new Date(customRange.endDate) : undefined,
  })

  const handleRangeSelect = (range: DateRangeOption) => {
    if (range === 'custom') {
      setIsCustomDialogOpen(true)
    } else {
      setSelectedRange(range)
    }
  }

  const handleCustomRangeConfirm = () => {
    if (tempDateRange.from && tempDateRange.to) {
      const startDate = format(tempDateRange.from, 'yyyy-MM-dd')
      const endDate = format(tempDateRange.to, 'yyyy-MM-dd')
      const label = `${format(tempDateRange.from, 'MMM d')} - ${format(tempDateRange.to, 'MMM d, yyyy')}`
      
      setCustomRange({
        startDate,
        endDate,
        label,
      })
      setSelectedRange('custom')
      setIsCustomDialogOpen(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                <CalendarDays className="mr-2 size-4" />
                {getDisplayLabel()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleRangeSelect('7days')}>
                Last 7 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRangeSelect('30days')}>
                Last 30 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRangeSelect('90days')}>
                Last 90 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRangeSelect('12months')}>
                Last 12 months
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleRangeSelect('custom')}>
                Custom Range...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Custom Date Range</DialogTitle>
            <DialogDescription>
              Choose a custom date range for your analytics data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <DateRangePicker
              date={tempDateRange}
              onDateChange={setTempDateRange}
              placeholder="Select date range"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCustomDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCustomRangeConfirm}
                disabled={!tempDateRange.from || !tempDateRange.to}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Apply Range
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}