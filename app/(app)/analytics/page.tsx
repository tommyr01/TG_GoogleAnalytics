"use client"

import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { MetricsCards } from "@/components/analytics/metrics-cards"
import { TrafficChart } from "@/components/analytics/traffic-chart"
import { TopPagesTable } from "@/components/analytics/top-pages-table"
import { AudienceChart } from "@/components/analytics/audience-chart"
import { DeviceChart } from "@/components/analytics/device-chart"
import { useAnalytics } from "@/hooks/use-analytics"

export default function AnalyticsPage() {
  const { data, isLoading, error, isConnected } = useAnalytics()

  return (
    <div className="flex flex-col space-y-6 p-6">
      <AnalyticsHeader 
        title="Analytics Overview" 
        description="Comprehensive view of your website performance and user engagement"
        isConnected={isConnected}
      />
      
      <MetricsCards 
        data={data?.overview} 
        isLoading={isLoading} 
        error={error} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficChart 
          data={data?.traffic} 
          isLoading={isLoading} 
          error={error} 
        />
        <AudienceChart 
          data={data?.audience} 
          isLoading={isLoading} 
          error={error} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopPagesTable 
            data={data?.topPages} 
            isLoading={isLoading} 
            error={error} 
          />
        </div>
        <DeviceChart 
          data={data?.devices} 
          isLoading={isLoading} 
          error={error} 
        />
      </div>
    </div>
  )
}