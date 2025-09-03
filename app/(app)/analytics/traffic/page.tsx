"use client"

import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { TrafficChart } from "@/components/analytics/traffic-chart"
import { TrafficSourcesChart } from "@/components/analytics/traffic-sources-chart"
import { RealTimeStats } from "@/components/analytics/real-time-stats"
import { useAnalytics } from "@/hooks/use-analytics"

export default function TrafficPage() {
  const { data, isLoading } = useAnalytics()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="size-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading traffic data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      <AnalyticsHeader 
        title="Traffic Analysis" 
        description="Detailed insights into your website traffic patterns and sources"
      />
      
      <RealTimeStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrafficChart data={data?.traffic} />
        </div>
        <TrafficSourcesChart />
      </div>
    </div>
  )
}