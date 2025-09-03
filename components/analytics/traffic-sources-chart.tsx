"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4']

const trafficSources = [
  { source: "Organic Search", users: 11234, percentage: 45.2 },
  { source: "Direct", users: 7134, percentage: 28.7 },
  { source: "Social Media", users: 3089, percentage: 12.4 },
  { source: "Referral", users: 2213, percentage: 8.9 },
  { source: "Email", users: 1192, percentage: 4.8 },
]

export function TrafficSourcesChart() {
  const renderLabel = (entry: { percentage: number }) => {
    return `${entry.percentage}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          Traffic Sources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={trafficSources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="users"
              >
                {trafficSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                formatter={(value, _name, props) => [
                  `${value} users (${props.payload.percentage}%)`,
                  props.payload.source
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-2">
          {trafficSources.map((source, index) => (
            <div key={source.source} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="size-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{source.source}</span>
              </div>
              <div className="font-medium">
                {source.users.toLocaleString()} ({source.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}