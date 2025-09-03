"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface DeviceChartProps {
  data?: Array<{
    device: string
    users: number
    percentage: number
  }>
}

const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4']

export function DeviceChart({ data }: DeviceChartProps) {
  // Mock data if none provided
  const defaultData = [
    { device: "Desktop", users: 12450, percentage: 52.3 },
    { device: "Mobile", users: 8901, percentage: 37.4 },
    { device: "Tablet", users: 2156, percentage: 9.1 },
    { device: "Other", users: 293, percentage: 1.2 },
  ]

  const chartData = data || defaultData

  const renderLabel = (entry: { percentage: number }) => {
    return `${entry.percentage}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          Device Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="users"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                formatter={(value, name, props) => [
                  `${value} users (${props.payload.percentage}%)`,
                  props.payload.device
                ]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}