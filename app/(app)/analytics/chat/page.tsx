"use client"

import { ChatInterface } from "@/components/analytics/chat-interface"
import { AnalyticsHeader } from "@/components/analytics/analytics-header"

export default function AnalyticsChatPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <AnalyticsHeader 
          title="Analytics Chat" 
          description="Ask questions about your analytics data in natural language"
        />
      </div>
      
      <div className="flex-1 px-6 pb-6">
        <ChatInterface />
      </div>
    </div>
  )
}