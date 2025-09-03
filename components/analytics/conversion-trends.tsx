"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const conversionTrendData = [
  { date: "Week 1", conversionRate: 2.1 },
  { date: "Week 2", conversionRate: 2.3 },
  { date: "Week 3", conversionRate: 2.8 },
  { date: "Week 4", conversionRate: 3.2 },
  { date: "Week 5", conversionRate: 2.9 },
  { date: "Week 6", conversionRate: 3.4 },
  { date: "Week 7", conversionRate: 3.8 },
  { date: "Week 8", conversionRate: 3.1 },
]

export function ConversionTrends() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          Conversion Rate Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={conversionTrendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs text-muted-foreground" />
              <YAxis 
                className="text-xs text-muted-foreground" 
                domain={[0, 5]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                formatter={(value) => [`${value}%`, 'Conversion Rate']}
              />
              <Line
                type="monotone"
                dataKey="conversionRate"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ fill: "#0d9488", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#0d9488" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}