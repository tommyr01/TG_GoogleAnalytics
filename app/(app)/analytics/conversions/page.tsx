"use client"

import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { ConversionFunnel } from "@/components/analytics/conversion-funnel"
import { ConversionGoals } from "@/components/analytics/conversion-goals"
import { ConversionTrends } from "@/components/analytics/conversion-trends"

export default function ConversionsPage() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <AnalyticsHeader 
        title="Conversion Analysis" 
        description="Track your goals and conversion performance"
      />
      
      <ConversionGoals />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnel />
        <ConversionTrends />
      </div>
    </div>
  )
}