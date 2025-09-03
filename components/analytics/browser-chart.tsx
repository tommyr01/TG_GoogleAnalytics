"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Progress } from "@/registry/new-york-v4/ui/progress"

const browserData = [
  { browser: "Chrome", users: 14523, percentage: 61.2, logo: "🌐" },
  { browser: "Safari", users: 5234, percentage: 22.1, logo: "🧭" },
  { browser: "Firefox", users: 2156, percentage: 9.1, logo: "🦊" },
  { browser: "Edge", users: 1234, percentage: 5.2, logo: "💎" },
  { browser: "Other", users: 589, percentage: 2.4, logo: "📱" },
]

export function BrowserChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          Browser Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {browserData.map((item) => (
            <div key={item.browser} className="flex items-center gap-3">
              <div className="text-2xl">{item.logo}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{item.browser}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.users.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}