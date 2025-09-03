"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"

interface TrafficChartProps {
  data?: Array<{
    date: string
    users: number
    pageViews: number
  }>
}

export function TrafficChart({ data }: TrafficChartProps) {
  // Mock data if none provided
  const defaultData = [
    { date: "Jan 1", users: 2400, pageViews: 4800 },
    { date: "Jan 2", users: 1398, pageViews: 3200 },
    { date: "Jan 3", users: 9800, pageViews: 15600 },
    { date: "Jan 4", users: 3908, pageViews: 7200 },
    { date: "Jan 5", users: 4800, pageViews: 9800 },
    { date: "Jan 6", users: 3800, pageViews: 8900 },
    { date: "Jan 7", users: 4300, pageViews: 10200 },
    { date: "Jan 8", users: 2400, pageViews: 4800 },
    { date: "Jan 9", users: 1398, pageViews: 3200 },
    { date: "Jan 10", users: 5800, pageViews: 12600 },
    { date: "Jan 11", users: 3908, pageViews: 7200 },
    { date: "Jan 12", users: 4800, pageViews: 9800 },
    { date: "Jan 13", users: 6800, pageViews: 13900 },
    { date: "Jan 14", users: 7300, pageViews: 15200 },
  ]

  const chartData = data || defaultData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          Website Traffic
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
              <Tooltip
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}