"use client"

import { AnalyticsNav } from "@/components/analytics/analytics-nav"
import { SidebarProvider, Sidebar, SidebarInset } from "@/registry/new-york-v4/ui/sidebar"

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <AnalyticsNav />
        </Sidebar>
        <SidebarInset className="flex-1">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}