"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type DateRangeOption = 
  | '7days'
  | '30days' 
  | '90days'
  | '12months'
  | 'custom'

export interface DateRange {
  startDate: string // ISO date string (YYYY-MM-DD)
  endDate: string   // ISO date string (YYYY-MM-DD)
}

export interface CustomDateRange extends DateRange {
  label: string
}

interface DateRangeContextType {
  selectedRange: DateRangeOption
  setSelectedRange: (range: DateRangeOption) => void
  customRange: CustomDateRange | null
  setCustomRange: (range: CustomDateRange | null) => void
  getEffectiveDateRange: () => DateRange
  getDisplayLabel: () => string
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined)

// Helper function to calculate predefined date ranges
function getPresetDateRange(option: DateRangeOption): DateRange {
  const endDate = new Date()
  const startDate = new Date()

  switch (option) {
    case '7days':
      startDate.setDate(endDate.getDate() - 7)
      break
    case '30days':
      startDate.setDate(endDate.getDate() - 30)
      break
    case '90days':
      startDate.setDate(endDate.getDate() - 90)
      break
    case '12months':
      startDate.setMonth(endDate.getMonth() - 12)
      break
    case 'custom':
      // For custom, we'll return a default 30-day range if no custom range is set
      startDate.setDate(endDate.getDate() - 30)
      break
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

// Helper function to get display labels
function getDateRangeLabel(option: DateRangeOption): string {
  switch (option) {
    case '7days':
      return 'Last 7 days'
    case '30days':
      return 'Last 30 days'
    case '90days':
      return 'Last 90 days'
    case '12months':
      return 'Last 12 months'
    case 'custom':
      return 'Custom Range'
    default:
      return 'Last 30 days'
  }
}

interface DateRangeProviderProps {
  children: ReactNode
}

export function DateRangeProvider({ children }: DateRangeProviderProps) {
  const [selectedRange, setSelectedRange] = useState<DateRangeOption>('30days')
  const [customRange, setCustomRange] = useState<CustomDateRange | null>(null)

  const getEffectiveDateRange = useCallback((): DateRange => {
    if (selectedRange === 'custom' && customRange) {
      return {
        startDate: customRange.startDate,
        endDate: customRange.endDate,
      }
    }
    return getPresetDateRange(selectedRange)
  }, [selectedRange, customRange])

  const getDisplayLabel = useCallback((): string => {
    if (selectedRange === 'custom' && customRange) {
      return customRange.label
    }
    return getDateRangeLabel(selectedRange)
  }, [selectedRange, customRange])

  const value: DateRangeContextType = {
    selectedRange,
    setSelectedRange,
    customRange,
    setCustomRange,
    getEffectiveDateRange,
    getDisplayLabel,
  }

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  )
}

export function useDateRange() {
  const context = useContext(DateRangeContext)
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider')
  }
  return context
}