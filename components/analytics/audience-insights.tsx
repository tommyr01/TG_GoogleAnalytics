"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Badge } from "@/registry/new-york-v4/ui/badge"
import { TrendingUp, TrendingDown, Clock, Heart } from "lucide-react"

const insights = [
  {
    title: "Peak Activity Time",
    value: "2:00 PM - 4:00 PM EST",
    trend: "up",
    description: "Your users are most active during afternoon hours",
    icon: <Clock className="size-4" />,
  },
  {
    title: "Returning Visitors",
    value: "68.5%",
    trend: "up",
    description: "Strong user loyalty with high return rate",
    icon: <Heart className="size-4" />,
  },
  {
    title: "Session Quality",
    value: "High Engagement",
    trend: "up",
    description: "Users spend quality time exploring your content",
    icon: <TrendingUp className="size-4" />,
  },
  {
    title: "Mobile Growth",
    value: "+23% this month",
    trend: "up",
    description: "Mobile traffic continues to grow significantly",
    icon: <TrendingUp className="size-4" />,
  },
]

export function AudienceInsights() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {insights.map((insight, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="p-1 bg-teal-100 dark:bg-teal-900 rounded">
                {insight.icon}
              </div>
              {insight.title}
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
  )
}