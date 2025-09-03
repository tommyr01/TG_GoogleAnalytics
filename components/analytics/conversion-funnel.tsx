"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"

const funnelData = [
  { stage: "Page Views", count: 24567, percentage: 100 },
  { stage: "Product Views", count: 8934, percentage: 36.4 },
  { stage: "Add to Cart", count: 2156, percentage: 8.8 },
  { stage: "Checkout", count: 891, percentage: 3.6 },
  { stage: "Purchase", count: 342, percentage: 1.4 },
]

export function ConversionFunnel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          Conversion Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelData.map((stage, index) => {
            const width = stage.percentage
            return (
              <div key={stage.stage} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">
                    {stage.count.toLocaleString()} ({stage.percentage}%)
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-8 flex items-center justify-center">
                    <div 
                      className="bg-gradient-to-r from-teal-600 to-teal-400 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-white text-xs font-medium">
                        {stage.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {index < funnelData.length - 1 && (
                  <div className="text-xs text-center text-red-600">
                    -{((funnelData[index].count - funnelData[index + 1].count) / funnelData[index].count * 100).toFixed(1)}% drop-off
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}