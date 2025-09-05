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

interface BrowserData {
  browser: string
  users: number
  percentage: number
  logo: string
}

const browserLogos: { [key: string]: string } = {
  "Chrome": "🌐",
  "Safari": "🧭", 
  "Firefox": "🦊",
  "Edge": "💎",
  "Internet Explorer": "🌍",
  "Opera": "🎭",
  "Samsung Internet": "📱",
  "Android Browser": "🤖",
  "Android Webview": "📱",
  "Safari (in-app)": "📱",
  "Whale Browser": "🐋",
  "Mozilla Compatible Agent": "🌐",
  "(not set)": "❓",
}

export function BrowserChart() {
  const [browserData, setBrowserData] = useState<BrowserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dateRangeContext = useDateRange()
  const API_URL = process.env.NEXT_PUBLIC_ANALYTICS_SERVER_URL || 'http://localhost:3000'

  useEffect(() => {
    const fetchBrowserData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const dateRangeParam = (() => {
          switch (dateRangeContext?.selectedRange) {
            case '7days':
              return '7days'
            case '30days':
              return '30days'
            case '90days':
              return '90days'
            case '12months':
              return '12months'
            default:
              return '30days'
          }
        })()

        const response = await fetch(`${API_URL}/api/devices?dateRange=${dateRangeParam}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch browser data: ${response.status}`)
        }

        const data = await response.json()
        
        // Aggregate browser data from devices array
        const browserMap = new Map<string, number>()
        let totalUsers = 0

        data.devices.forEach((device: { browser?: string, users?: number }) => {
          const browserName = device.browser || '(not set)'
          const users = device.users || 0
          browserMap.set(browserName, (browserMap.get(browserName) || 0) + users)
          totalUsers += users
        })

        // Convert to array and calculate percentages
        const transformedData: BrowserData[] = Array.from(browserMap.entries())
          .map(([browser, users]) => ({
            browser,
            users,
            percentage: totalUsers > 0 ? (users / totalUsers) * 100 : 0,
            logo: browserLogos[browser] || "🌐"
          }))
          .sort((a, b) => b.users - a.users) // Sort by user count descending
          .slice(0, 8) // Take top 8 browsers

        setBrowserData(transformedData)
      } catch (err) {
        console.error('Failed to fetch browser data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load browser data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrowserData()
  }, [dateRangeContext?.selectedRange, API_URL])

  if (error) {
    return (
      <TooltipProvider>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-teal-600" />
              Browser Usage
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="size-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>Shows which web browsers your visitors use to access your site. This information helps you prioritize browser compatibility and testing efforts for the best user experience.</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-sm text-muted-foreground">Error loading browser data: {error}</p>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-teal-600" />
            Browser Usage
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Shows which web browsers your visitors use to access your site. This information helps you prioritize browser compatibility and testing efforts for the best user experience.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-sm text-muted-foreground">Loading browser data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {browserData.map((item) => (
                <div key={item.browser} className="flex items-center gap-3">
                  <div className="text-2xl">{item.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{item.browser}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.users.toLocaleString()} ({item.percentage.toFixed(1)}%)
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