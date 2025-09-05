"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/registry/new-york-v4/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { useAnalytics } from "@/hooks/use-analytics"

const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4']

interface TrafficSource {
  source: string
  sessions: number
  percentage: number
}

interface LiveTrafficData {
  sources: Array<{
    source: string
    medium: string
    sessions: number
    users: number
    engagedSessions: number
    engagementRate: number
  }>
}

export function TrafficSourcesChart() {
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([])
  const [hasRealData, setHasRealData] = useState(false)

  useEffect(() => {
    async function fetchTrafficSources() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_SERVER_URL || 'http://localhost:3000'}/api/traffic`)
        if (response.ok) {
          const data: LiveTrafficData = await response.json()
          
          // Transform GA4 data to our chart format
          const totalSessions = data.sources.reduce((sum, source) => sum + source.sessions, 0)
          
          // Use channel group data directly (no need to group since it's already grouped)
          const sortedSources = data.sources
            .map(source => ({
              source: source.source,
              sessions: source.sessions,
              percentage: parseFloat(((source.sessions / totalSessions) * 100).toFixed(1))
            }))
            .sort((a, b) => b.sessions - a.sessions)
            .slice(0, 8) // Top 8 sources to match GA4
          
          setTrafficSources(sortedSources)
          setHasRealData(true)
        } else {
          console.warn('Failed to fetch traffic sources - API response not ok')
          setHasRealData(false)
        }
      } catch (error) {
        console.warn('Failed to fetch traffic sources:', error)
        setHasRealData(false)
      }
    }

    fetchTrafficSources()
  }, [])
  const renderLabel = (entry: { percentage: number }) => {
    return `${entry.percentage}%`
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-teal-600" />
            Traffic Sources
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Shows where your visitors are coming from - organic search, direct visits, social media, referrals, and paid advertising. This helps you understand which marketing channels are driving the most traffic to your site.</p>
              </TooltipContent>
            </UITooltip>
          </CardTitle>
        </CardHeader>
      <CardContent>
        {!hasRealData ? (
          <div className="h-[300px] flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center text-muted-foreground">
              <p className="font-medium">Loading Traffic Sources Data...</p>
              <p className="text-sm mt-1">Fetching source data from GA4 API</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sessions"
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value, _name, props) => [
                      `${value} sessions (${props.payload.percentage}%)`,
                      props.payload.source
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              {trafficSources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="size-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{source.source}</span>
                  </div>
                  <div className="font-medium">
                    {source.sessions.toLocaleString()} ({source.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  )
}