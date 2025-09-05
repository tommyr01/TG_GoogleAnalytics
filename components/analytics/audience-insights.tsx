"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Badge } from "@/registry/new-york-v4/ui/badge"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/registry/new-york-v4/ui/tooltip"
import { TrendingUp, TrendingDown, Clock, Heart, HelpCircle } from "lucide-react"

const insights = [
  {
    title: "Peak Activity Time",
    value: "2:00 PM - 4:00 PM EST",
    trend: "up",
    description: "Your users are most active during afternoon hours",
    tooltip: "Based on historical traffic patterns, this shows when your users are most likely to be online and engaged with your content. Use this to time important updates or campaigns.",
    icon: <Clock className="size-4" />,
  },
  {
    title: "Returning Visitors",
    value: "68.5%",
    trend: "up",
    description: "Strong user loyalty with high return rate",
    tooltip: "The percentage of users who have visited your site before. A higher return rate indicates good content quality and user satisfaction. Industry average is typically 30-50%.",
    icon: <Heart className="size-4" />,
  },
  {
    title: "Session Quality",
    value: "High Engagement",
    trend: "up",
    description: "Users spend quality time exploring your content",
    tooltip: "Measured by metrics like session duration, pages per session, and bounce rate. High engagement suggests users find your content valuable and are exploring multiple pages.",
    icon: <TrendingUp className="size-4" />,
  },
  {
    title: "Mobile Growth",
    value: "+23% this month",
    trend: "up",
    description: "Mobile traffic continues to grow significantly",
    tooltip: "The growth in mobile visitors compared to the previous period. Mobile-first design is crucial as mobile traffic typically accounts for 50-70% of web traffic.",
    icon: <TrendingUp className="size-4" />,
  },
]

export function AudienceInsights() {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-1 bg-teal-100 dark:bg-teal-900 rounded">
                  {insight.icon}
                </div>
                {insight.title}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="size-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>{insight.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{insight.value}</span>
                  <Badge variant={insight.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                    {insight.trend === 'up' ? (
                      <TrendingUp className="size-3 mr-1" />
                    ) : (
                      <TrendingDown className="size-3 mr-1" />
                    )}
                    {insight.trend === 'up' ? 'Growing' : 'Declining'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {insight.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}