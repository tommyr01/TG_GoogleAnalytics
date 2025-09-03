"use client"

import { ArrowUpIcon, ArrowDownIcon, Users, Eye, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"

interface MetricCardData {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ReactNode
}

interface MetricsCardsProps {
  data?: {
    totalUsers: number
    pageViews: number
    avgSessionDuration: string
    bounceRate: string
    userChange: string
    pageViewsChange: string
    sessionChange: string
    bounceChange: string
  }
}

export function MetricsCards({ data }: MetricsCardsProps) {
  // Mock data if none provided
  const defaultData = {
    totalUsers: 24567,
    pageViews: 89234,
    avgSessionDuration: "2m 34s",
    bounceRate: "32.4%",
    userChange: "+12.5%",
    pageViewsChange: "+8.2%",
    sessionChange: "+5.7%",
    bounceChange: "-2.1%",
  }

  const metrics = data || defaultData

  const cards: MetricCardData[] = [
    {
      title: "Total Users",
      value: metrics.totalUsers.toLocaleString(),
      change: metrics.userChange,
      changeType: metrics.userChange.startsWith('+') ? 'positive' : 'negative',
      icon: <Users className="size-5 text-teal-600" />,
    },
    {
      title: "Page Views",
      value: metrics.pageViews.toLocaleString(),
      change: metrics.pageViewsChange,
      changeType: metrics.pageViewsChange.startsWith('+') ? 'positive' : 'negative',
      icon: <Eye className="size-5 text-teal-600" />,
    },
    {
      title: "Avg. Session Duration",
      value: metrics.avgSessionDuration,
      change: metrics.sessionChange,
      changeType: metrics.sessionChange.startsWith('+') ? 'positive' : 'negative',
      icon: <Clock className="size-5 text-teal-600" />,
    },
    {
      title: "Bounce Rate",
      value: metrics.bounceRate,
      change: metrics.bounceChange,
      changeType: metrics.bounceChange.startsWith('-') ? 'positive' : 'negative', // Lower bounce rate is better
      icon: <TrendingUp className="size-5 text-teal-600" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
            <div className="flex items-center space-x-1 text-xs">
              {card.changeType === 'positive' ? (
                <ArrowUpIcon className="size-3 text-green-500" />
              ) : (
                <ArrowDownIcon className="size-3 text-red-500" />
              )}
              <span
                className={
                  card.changeType === 'positive'
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {card.change}
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}