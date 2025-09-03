"use client"

import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { MetricsCards } from "@/components/analytics/metrics-cards"
import { TrafficChart } from "@/components/analytics/traffic-chart"
import { TopPagesTable } from "@/components/analytics/top-pages-table"
import { AudienceChart } from "@/components/analytics/audience-chart"
import { DeviceChart } from "@/components/analytics/device-chart"
import { useAnalytics } from "@/hooks/use-analytics"

export default function AnalyticsPage() {
  const { data, isLoading, error } = useAnalytics()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="size-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2">Failed to load analytics data</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      <AnalyticsHeader 
        title="Analytics Overview" 
        description="Comprehensive view of your website performance and user engagement"
      />
      
      <MetricsCards data={data?.overview} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficChart data={data?.traffic} />
        <AudienceChart data={data?.audience} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopPagesTable data={data?.topPages} />
        </div>
        <DeviceChart data={data?.devices} />
      </div>
    </div>
  )
}