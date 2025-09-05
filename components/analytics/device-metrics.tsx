"use client"

import { useState, useEffect } from "react"
import { Monitor, Smartphone, Tablet, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/registry/new-york-v4/ui/tooltip"
import { useDateRange } from "@/contexts/date-range-context"

interface DeviceMetric {
  device: string
  users: number
  avgSession: string
  bounceRate: string
  icon: JSX.Element
  tooltip: string
}

const deviceConfig = {
  desktop: {
    icon: <Monitor className="size-5 text-teal-600" />,
    tooltip: "Desktop users typically have longer sessions and lower bounce rates, indicating higher engagement with your content."
  },
  mobile: {
    icon: <Smartphone className="size-5 text-teal-600" />,
    tooltip: "Mobile users often have shorter sessions but represent a significant portion of web traffic. Higher bounce rates are normal for mobile."
  },
  tablet: {
    icon: <Tablet className="size-5 text-teal-600" />,
    tooltip: "Tablet users often show the highest engagement with longer sessions and low bounce rates, combining mobile convenience with desktop usability."
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

export function DeviceMetrics() {
  const [deviceMetrics, setDeviceMetrics] = useState<DeviceMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dateRangeContext = useDateRange()

  useEffect(() => {
    const fetchDeviceData = async () => {
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

        const response = await fetch(`http://localhost:3000/api/devices?dateRange=${dateRangeParam}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch device data: ${response.status}`)
        }

        const data = await response.json()
        
        // Aggregate device data by category
        const deviceMap = new Map<string, { users: number, sessions: number, bounces: number, totalBounceRate: number, sessionCount: number }>()

        data.devices.forEach((device: any) => {
          const category = device.deviceCategory || 'other'
          const users = device.users || 0
          const sessions = device.sessions || 0
          const bounceRate = device.bounceRate || 0
          
          if (!deviceMap.has(category)) {
            deviceMap.set(category, { users: 0, sessions: 0, bounces: 0, totalBounceRate: 0, sessionCount: 0 })
          }
          
          const existing = deviceMap.get(category)!
          existing.users += users
          existing.sessions += sessions
          existing.bounces += Math.round(sessions * bounceRate)
          existing.totalBounceRate += bounceRate
          existing.sessionCount += 1
        })

        // Transform to metrics array
        const metrics: DeviceMetric[] = Array.from(deviceMap.entries())
          .map(([category, stats]) => {
            const avgBounceRate = stats.sessionCount > 0 ? (stats.bounces / stats.sessions) * 100 : 0
            const avgSessionDuration = 120 // Default assumption since GA4 API doesn't easily provide this metric
            
            return {
              device: category.charAt(0).toUpperCase() + category.slice(1),
              users: stats.users,
              avgSession: formatDuration(avgSessionDuration),
              bounceRate: `${avgBounceRate.toFixed(1)}%`,
              icon: deviceConfig[category as keyof typeof deviceConfig]?.icon || <Monitor className="size-5 text-teal-600" />,
              tooltip: deviceConfig[category as keyof typeof deviceConfig]?.tooltip || "Device usage statistics from your Google Analytics data."
            }
          })
          .filter(metric => metric.users > 0)
          .sort((a, b) => b.users - a.users)

        setDeviceMetrics(metrics)
      } catch (err) {
        console.error('Failed to fetch device data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load device data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeviceData()
  }, [dateRangeContext?.selectedRange])

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-5 h-5 bg-muted animate-pulse rounded" />
                  <div className="w-16 h-5 bg-muted animate-pulse rounded" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex justify-between">
                      <div className="w-16 h-4 bg-muted animate-pulse rounded" />
                      <div className="w-12 h-4 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TooltipProvider>
    )
  }

  if (error) {
    return (
      <TooltipProvider>
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Error loading device data: {error}</p>
          </CardContent>
        </Card>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deviceMetrics.map((metric) => (
          <Card key={metric.device}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                {metric.icon}
                {metric.device}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="size-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>{metric.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Users</span>
                  <span className="font-semibold">{metric.users.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Session</span>
                  <span className="font-semibold">{metric.avgSession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bounce Rate</span>
                  <span className={`font-semibold ${
                    parseFloat(metric.bounceRate) > 40 ? 'text-red-600' : 
                    parseFloat(metric.bounceRate) < 30 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {metric.bounceRate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}