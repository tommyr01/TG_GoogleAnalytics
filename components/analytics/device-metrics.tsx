"use client"

import { Monitor, Smartphone, Tablet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"

const deviceMetrics = [
  {
    device: "Desktop",
    users: 12450,
    avgSession: "3m 42s",
    bounceRate: "28.4%",
    icon: <Monitor className="size-5 text-teal-600" />,
  },
  {
    device: "Mobile",
    users: 8901,
    avgSession: "2m 18s",
    bounceRate: "45.7%",
    icon: <Smartphone className="size-5 text-teal-600" />,
  },
  {
    device: "Tablet",
    users: 2156,
    avgSession: "4m 12s",
    bounceRate: "22.1%",
    icon: <Tablet className="size-5 text-teal-600" />,
  },
]

export function DeviceMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {deviceMetrics.map((metric) => (
        <Card key={metric.device}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              {metric.icon}
              {metric.device}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Users</span>
                <span className="font-semibold">{metric.users.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg. Session</span>
                <span className="font-semibold">{metric.avgSession}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bounce Rate</span>
                <span className={`font-semibold ${
                  parseFloat(metric.bounceRate) > 40 ? 'text-red-600' : 
                  parseFloat(metric.bounceRate) < 30 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {metric.bounceRate}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}