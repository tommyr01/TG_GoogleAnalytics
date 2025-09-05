"use client"

import { AlertTriangle, HelpCircle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton"
import { Alert, AlertDescription } from "@/registry/new-york-v4/ui/alert"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/registry/new-york-v4/ui/tooltip"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from "recharts"

interface TrafficChartProps {
  data?: Array<{
    date: string
    users: number
    pageViews: number
    sessions: number
  }>
  isLoading?: boolean
  error?: string | null
}

export function TrafficChart({ data, isLoading = false, error }: TrafficChartProps) {
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="size-3 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <Skeleton className="h-4 w-48 mx-auto" />
              <Skeleton className="h-4 w-36 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-red-500" />
            Website Traffic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              Failed to load traffic data. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // No data available state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-muted" />
            <span>Website Traffic</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="size-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>Daily traffic trends showing users, sessions, and page views over time</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center text-muted-foreground space-y-3">
              <Info className="size-8 mx-auto text-muted-foreground/50" />
              <div>
                <p className="font-medium">No Traffic Data Available</p>
                <p className="text-sm mt-1">
                  for the selected date range
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Data available - show chart
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          <span>Website Traffic</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Daily traffic trends showing users, sessions, and page views from your website</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#0d9488"
                strokeWidth={2}
                dot={{ fill: "#0d9488", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#0d9488" }}
                name="Users"
              />
              <Line
                type="monotone"
                dataKey="pageViews"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ fill: "#14b8a6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#14b8a6" }}
                name="Page Views"
              />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="#2dd4bf"
                strokeWidth={2}
                dot={{ fill: "#2dd4bf", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#2dd4bf" }}
                name="Sessions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Traffic trends for selected period
        </div>
      </CardContent>
    </Card>
  )
}