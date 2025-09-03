"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Activity, Users, Eye, Globe } from "lucide-react"

interface RealTimeData {
  activeUsers: number
  pageViewsPerMinute: number
  topCountry: string
  topPage: string
}

export function RealTimeStats() {
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    activeUsers: 127,
    pageViewsPerMinute: 34,
    topCountry: "United States",
    topPage: "/products",
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        activeUsers: Math.max(50, prev.activeUsers + Math.floor(Math.random() * 21) - 10),
        pageViewsPerMinute: Math.max(10, prev.pageViewsPerMinute + Math.floor(Math.random() * 11) - 5),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-green-500 animate-pulse" />
          Real-Time Activity
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
  )
}