"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"

interface AudienceChartProps {
  data?: Array<{
    ageGroup: string
    users: number
    percentage: number
  }>
}

export function AudienceChart({ data }: AudienceChartProps) {
  // Mock data if none provided
  const defaultData = [
    { ageGroup: "18-24", users: 3245, percentage: 18.2 },
    { ageGroup: "25-34", users: 8901, percentage: 35.6 },
    { ageGroup: "35-44", users: 6234, percentage: 24.8 },
    { ageGroup: "45-54", users: 3456, percentage: 13.8 },
    { ageGroup: "55-64", users: 1567, percentage: 6.2 },
    { ageGroup: "65+", users: 890, percentage: 3.6 },
  ]

  const chartData = data || defaultData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          Audience by Age
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="ageGroup" 
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
                formatter={(value) => [
                  `${value} users (${chartData.find(d => d.users === value)?.percentage}%)`,
                  'Users'
                ]}
              />
              <Bar
                dataKey="users"
                fill="#0d9488"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}