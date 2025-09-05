"use client"

import { Users, Eye, Clock, Target, AlertCircle, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/registry/new-york-v4/ui/tooltip"

interface MetricCardData {
  title: string
  description: string
  value: string | number
  icon: React.ReactNode
  format: 'number' | 'string' | 'percentage'
}

interface MetricsCardsProps {
  data?: {
    sessions: number
    totalUsers: number
    pageViews: number
    avgSessionDuration: string
    bounceRate: string
    engagementRate: string
  } | null
  isLoading?: boolean
  error?: string | null
}

export function MetricsCards({ data, isLoading = false, error }: MetricsCardsProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Metric {index + 1}
              </CardTitle>
              <AlertCircle className="size-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-red-600">Failed to load data</div>
              <div className="text-xs text-muted-foreground mt-1">
                Please check your connection
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // No data state
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-dashed border-muted-foreground/25">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Metric {index + 1}
              </CardTitle>
              <div className="size-5 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">No data available</div>
              <div className="text-xs text-muted-foreground mt-1">
                for the selected period
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards: MetricCardData[] = [
    {
      title: "Sessions",
      description: "Total number of sessions - each session can contain multiple page views from the same user",
      value: data.sessions,
      format: 'number',
      icon: <Target className="size-5 text-teal-600" />,
    },
    {
      title: "Users",
      description: "Unique visitors - the number of individual people who visited your site",
      value: data.totalUsers,
      format: 'number',
      icon: <Users className="size-5 text-teal-600" />,
    },
    {
      title: "Page Views",
      description: "Total number of pages viewed - multiple views of the same page are counted separately",
      value: data.pageViews,
      format: 'number',
      icon: <Eye className="size-5 text-teal-600" />,
    },
    {
      title: "Avg. Session Duration",
      description: "Average time users spend on your site during a session",
      value: data.avgSessionDuration,
      format: 'string',
      icon: <Clock className="size-5 text-teal-600" />,
    },
  ]

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="size-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>{card.description}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {card.format === 'number' 
                  ? (card.value as number).toLocaleString() 
                  : card.value
                }
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                for selected period
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}