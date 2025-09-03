"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts"

const pagePerformanceData = [
  { page: "/", loadTime: 1.2, bounceRate: 45.2, satisfaction: 8.2 },
  { page: "/products", loadTime: 2.1, bounceRate: 38.7, satisfaction: 7.8 },
  { page: "/about", loadTime: 1.8, bounceRate: 29.4, satisfaction: 8.9 },
  { page: "/contact", loadTime: 1.5, bounceRate: 67.8, satisfaction: 6.1 },
  { page: "/blog", loadTime: 2.8, bounceRate: 23.1, satisfaction: 9.2 },
  { page: "/pricing", loadTime: 1.9, bounceRate: 41.6, satisfaction: 7.5 },
]

export function PagePerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          Page Load Time Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pagePerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="page" 
                className="text-xs text-muted-foreground"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                className="text-xs text-muted-foreground"
                tick={{ fontSize: 12 }}
                label={{ value: 'Load Time (seconds)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value, name) => {
                  if (name === 'loadTime') return [`${value}s`, 'Load Time']
                  return [value, name]
                }}
              />
              <ReferenceLine y={2.5} stroke="red" strokeDasharray="5 5" label="Slow Threshold" />
              <Bar
                dataKey="loadTime"
                fill="#0d9488"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">4</div>
            <div className="text-muted-foreground">Fast Pages (&lt;2s)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">1</div>
            <div className="text-muted-foreground">Moderate (2-3s)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">1</div>
            <div className="text-muted-foreground">Slow (&gt;3s)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}