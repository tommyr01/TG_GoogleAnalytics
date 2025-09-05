"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/registry/new-york-v4/ui/tooltip"
import { HelpCircle } from "lucide-react"

export function ConversionFunnel() {
  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-teal-600" />
            Conversion Funnel
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Shows the customer journey from initial page visit to final conversion. Requires ecommerce tracking or funnel setup in Google Analytics to display conversion stages.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <HelpCircle className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="font-medium text-sm mb-2">Conversion Funnel Not Available</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                To see conversion funnels, you need to set up ecommerce tracking or create custom funnel reports in Google Analytics.
              </p>
              <div className="mt-3">
                <a 
                  href="https://support.google.com/analytics/answer/9327974" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-teal-600 hover:text-teal-700 underline"
                >
                  Learn about funnel exploration →
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}