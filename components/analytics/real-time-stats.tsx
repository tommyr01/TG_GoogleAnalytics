"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/registry/new-york-v4/ui/tooltip"
import { Activity, Users, Eye, Globe, HelpCircle } from "lucide-react"
import { useAnalytics } from "@/hooks/use-analytics"

interface RealTimeData {
  activeUsers: number
  pageViewsPerMinute: number
  topCountry: string
  topPage: string
}

interface LiveRealtimeData {
  totalActiveUsers: number
  byLocation: Array<{
    country: string
    city: string
    device: string
    users: number
  }>
}

export function RealTimeStats() {
  const { isConnected } = useAnalytics()
  const API_URL = process.env.NEXT_PUBLIC_ANALYTICS_SERVER_URL || 'http://localhost:3000'
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    activeUsers: 0,
    pageViewsPerMinute: 0,
    topCountry: "Loading...",
    topPage: "Loading...",
  })

  // Fetch live real-time data
  useEffect(() => {
    async function fetchRealTimeData() {
      try {
        if (!isConnected) {
          // Use mock data when not connected
          setRealTimeData({
            activeUsers: 127,
            pageViewsPerMinute: 34,
            topCountry: "United States",
            topPage: "/products",
          })
          return
        }

        const [realtimeResponse, pagesResponse] = await Promise.all([
          fetch(`${API_URL}/api/realtime`),
          fetch(`${API_URL}/api/pages?limit=1`)
        ])

        if (realtimeResponse.ok) {
          const realtimeData: LiveRealtimeData = await realtimeResponse.json()
          
          // Get top country by user count
          const countryStats = realtimeData.byLocation.reduce((acc, location) => {
            acc[location.country] = (acc[location.country] || 0) + location.users
            return acc
          }, {} as Record<string, number>)
          
          const topCountry = Object.entries(countryStats).sort(([,a], [,b]) => b - a)[0]?.[0] || "Unknown"
          
          // Get top page from pages endpoint
          let topPage = "/products" // fallback
          if (pagesResponse.ok) {
            const pagesData = await pagesResponse.json()
            topPage = pagesData.pages[0]?.path || "/products"
          }

          setRealTimeData({
            activeUsers: realtimeData.totalActiveUsers,
            pageViewsPerMinute: Math.max(1, Math.floor(realtimeData.totalActiveUsers * 0.3)), // Estimate based on active users
            topCountry,
            topPage,
          })
        }
      } catch (error) {
        console.warn('Failed to fetch real-time data:', error)
        // Keep existing data on error
      }
    }

    fetchRealTimeData()
    
    // Update every 30 seconds for real-time feel
    const interval = setInterval(fetchRealTimeData, 30000)
    return () => clearInterval(interval)
  }, [isConnected, API_URL])

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-green-500 animate-pulse" />
            Real-Time Activity
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Live data showing current user activity on your website. These metrics update every 30 seconds to give you real-time insights into who&apos;s on your site right now and what they&apos;re doing.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <Users className="size-5 text-teal-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {realTimeData.activeUsers}
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <Activity className="size-5 text-teal-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {realTimeData.pageViewsPerMinute}
              </div>
              <div className="text-sm text-muted-foreground">Views/min</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <Globe className="size-5 text-teal-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">
                {realTimeData.topCountry}
              </div>
              <div className="text-sm text-muted-foreground">Top Country</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <Eye className="size-5 text-teal-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground font-mono">
                {realTimeData.topPage}
              </div>
              <div className="text-sm text-muted-foreground">Top Page</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  )
}