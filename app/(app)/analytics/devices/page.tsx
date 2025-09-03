"use client"

import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { DeviceChart } from "@/components/analytics/device-chart"
import { BrowserChart } from "@/components/analytics/browser-chart"
import { DeviceMetrics } from "@/components/analytics/device-metrics"
import { useAnalytics } from "@/hooks/use-analytics"

export default function DevicesPage() {
  const { data, isLoading } = useAnalytics()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="size-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading devices data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      <AnalyticsHeader 
        title="Devices & Technology" 
        description="Understanding how users access your website"
      />
      
      <DeviceMetrics />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceChart data={data?.devices} />
        <BrowserChart />
      </div>
    </div>
  )
}