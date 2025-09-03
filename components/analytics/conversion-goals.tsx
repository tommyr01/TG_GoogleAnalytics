"use client"

import { Target, TrendingUp, DollarSign, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Progress } from "@/registry/new-york-v4/ui/progress"

const goals = [
  {
    name: "Newsletter Signups",
    current: 342,
    target: 500,
    icon: <Users className="size-5 text-teal-600" />,
    color: "bg-blue-500",
  },
  {
    name: "Product Purchases",
    current: 89,
    target: 150,
    icon: <DollarSign className="size-5 text-teal-600" />,
    color: "bg-green-500",
  },
  {
    name: "Contact Form",
    current: 156,
    target: 200,
    icon: <Target className="size-5 text-teal-600" />,
    color: "bg-purple-500",
  },
  {
    name: "Blog Engagement",
    current: 234,
    target: 300,
    icon: <TrendingUp className="size-5 text-teal-600" />,
    color: "bg-orange-500",
  },
]

export function ConversionGoals() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {goals.map((goal) => {
        const percentage = (goal.current / goal.target) * 100
        return (
          <Card key={goal.name}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {goal.icon}
                  <span>{goal.name}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{goal.current}</span>
                  <span className="text-muted-foreground">of {goal.target}</span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {percentage.toFixed(1)}% complete
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}