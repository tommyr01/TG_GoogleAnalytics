"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Progress } from "@/registry/new-york-v4/ui/progress"

const countryData = [
  { country: "United States", users: 8234, percentage: 33.5, flag: "🇺🇸" },
  { country: "United Kingdom", users: 3456, percentage: 14.1, flag: "🇬🇧" },
  { country: "Germany", users: 2789, percentage: 11.3, flag: "🇩🇪" },
  { country: "France", users: 2134, percentage: 8.7, flag: "🇫🇷" },
  { country: "Canada", users: 1678, percentage: 6.8, flag: "🇨🇦" },
  { country: "Australia", users: 1456, percentage: 5.9, flag: "🇦🇺" },
  { country: "Japan", users: 1234, percentage: 5.0, flag: "🇯🇵" },
  { country: "Other", users: 3586, percentage: 14.6, flag: "🌍" },
]

export function GeographyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          Top Countries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {countryData.map((item) => (
            <div key={item.country} className="flex items-center gap-3">
              <div className="text-2xl">{item.flag}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{item.country}</span>
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