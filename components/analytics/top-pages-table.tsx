"use client"

import { AlertTriangle, ExternalLink, HelpCircle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton"
import { Alert, AlertDescription } from "@/registry/new-york-v4/ui/alert"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/registry/new-york-v4/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table"

interface TopPagesTableProps {
  data?: Array<{
    page: string
    pageViews: number
    uniqueViews: number
    avgTimeOnPage: string
    bounceRate: string
  }>
  isLoading?: boolean
  error?: string | null
}

export function TopPagesTable({ data, isLoading = false, error }: TopPagesTableProps) {
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="size-3 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Page Views</TableHead>
                <TableHead className="text-right">Unique Views</TableHead>
                <TableHead className="text-right">Avg. Time</TableHead>
                <TableHead className="text-right">Bounce Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-red-500" />
            Top Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              Failed to load page data. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // No data available state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-muted" />
            <span>Top Pages</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="size-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>Most visited pages on your website with engagement metrics</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center text-muted-foreground space-y-3">
              <Info className="size-8 mx-auto text-muted-foreground/50" />
              <div>
                <p className="font-medium">No Page Data Available</p>
                <p className="text-sm mt-1">
                  for the selected date range
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Data available - show table
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          <span>Top Pages</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Most visited pages with page views, unique visitors, time spent, and bounce rates</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-right">Page Views</TableHead>
              <TableHead className="text-right">Unique Views</TableHead>
              <TableHead className="text-right">Avg. Time</TableHead>
              <TableHead className="text-right">Bounce Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-teal-600 font-mono text-sm">{row.page}</span>
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {row.pageViews.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {row.uniqueViews.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {row.avgTimeOnPage}
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-medium ${
                    parseFloat(row.bounceRate) > 50 
                      ? 'text-red-600' 
                      : parseFloat(row.bounceRate) < 30 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {row.bounceRate}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Real-time GA4 page data
        </div>
      </CardContent>
    </Card>
  )
}