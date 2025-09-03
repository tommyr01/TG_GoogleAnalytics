"use client"

import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { TopPagesTable } from "@/components/analytics/top-pages-table"
import { PagePerformanceChart } from "@/components/analytics/page-performance-chart"
import { useAnalytics } from "@/hooks/use-analytics"

export default function PagesPage() {
  const { data, isLoading } = useAnalytics()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="size-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pages data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      <AnalyticsHeader 
        title="Pages Analysis" 
        description="Performance metrics and insights for individual pages"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <TopPagesTable data={data?.topPages} />
        </div>
      </div>
      
      <PagePerformanceChart />
    </div>
  )
}