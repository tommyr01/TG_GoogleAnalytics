"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Progress } from "@/registry/new-york-v4/ui/progress"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/registry/new-york-v4/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { useDateRange } from "@/contexts/date-range-context"

interface CountryData {
  country: string
  users: number
  percentage: number
  flag: string
}

const countryFlags: Record<string, string> = {
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧", 
  "Germany": "🇩🇪",
  "France": "🇫🇷",
  "Canada": "🇨🇦",
  "Australia": "🇦🇺",
  "Japan": "🇯🇵",
  "India": "🇮🇳",
  "Philippines": "🇵🇭",
  "South Africa": "🇿🇦",
  "China": "🇨🇳",
  "Singapore": "🇸🇬",
  "Netherlands": "🇳🇱",
  "Italy": "🇮🇹",
  "Spain": "🇪🇸",
  "Brazil": "🇧🇷",
  "Mexico": "🇲🇽",
  "Poland": "🇵🇱",
  "Sweden": "🇸🇪",
  "Norway": "🇳🇴",
  "(not set)": "🌍",
  "Other": "🌍"
}

export function GeographyChart() {
  const [countryData, setCountryData] = useState<CountryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const API_URL = process.env.NEXT_PUBLIC_ANALYTICS_SERVER_URL || 'http://localhost:3000'
  
  const { getEffectiveDateRange, selectedRange, customRange } = useDateRange()

  useEffect(() => {
    async function fetchGeographyData() {
      try {
        setIsLoading(true)
        setError(null)
        
        const dateRange = getEffectiveDateRange()
        const dateRangeParam = selectedRange === 'custom' && customRange 
          ? `custom:${dateRange.startDate}:${dateRange.endDate}`
          : selectedRange

        const response = await fetch(`${API_URL}/api/geography?dateRange=${dateRangeParam}&limit=8`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch geography data: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        const transformedData: CountryData[] = data.countries.map((country: any) => ({
          country: country.country,
          users: country.users,
          percentage: country.percentage,
          flag: countryFlags[country.country] || "🌍"
        }))
        
        setCountryData(transformedData)
      } catch (err) {
        console.error('Failed to fetch geography data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load geography data')
        setCountryData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchGeographyData()
  }, [selectedRange, customRange, getEffectiveDateRange])

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-teal-600" />
            <span>Top Countries</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Geographic distribution of your website visitors by country. This helps identify your key markets and international reach.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-2 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Unable to load geography data</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        ) : countryData.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No country data available for this period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {countryData.map((item) => (
              <div key={item.country} className="flex items-center gap-3">
                <div className="text-2xl">{item.flag}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{item.country}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.users.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  )
}