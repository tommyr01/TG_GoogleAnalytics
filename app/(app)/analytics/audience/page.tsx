"use client"

import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { AudienceChart } from "@/components/analytics/audience-chart"
import { GeographyChart } from "@/components/analytics/geography-chart"
import { AudienceInsights } from "@/components/analytics/audience-insights"
import { useAnalytics } from "@/hooks/use-analytics"

export default function AudiencePage() {
  const { data, isLoading } = useAnalytics()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="size-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading audience data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      <AnalyticsHeader 
        title="Audience Analysis" 
        description="Understanding your user demographics and behavior patterns"
      />
      
      <AudienceInsights />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AudienceChart data={data?.audience} />
        <GeographyChart />
      </div>
    </div>
  )
}