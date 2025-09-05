"use client"

import { Target, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/registry/new-york-v4/ui/tooltip"


export function ConversionGoals() {
  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-teal-600" />
            Conversion Goals
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Shows progress toward your conversion goals. Requires custom conversion events or goals to be configured in Google Analytics to display accurate tracking data.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="font-medium text-sm mb-2">Conversion Goals Not Configured</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                To track conversion goals, you need to set up custom conversion events or goals in your Google Analytics property.
              </p>
              <div className="mt-3">
                <a 
                  href="https://support.google.com/analytics/answer/1032415" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-teal-600 hover:text-teal-700 underline"
                >
                  Learn about setting up conversion goals →
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}