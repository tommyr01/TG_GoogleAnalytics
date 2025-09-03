"use client"

import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
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
}

export function TopPagesTable({ data }: TopPagesTableProps) {
  // Mock data if none provided
  const defaultData = [
    {
      page: "/",
      pageViews: 15234,
      uniqueViews: 12891,
      avgTimeOnPage: "2:34",
      bounceRate: "45.2%",
    },
    {
      page: "/products",
      pageViews: 8945,
      uniqueViews: 7234,
      avgTimeOnPage: "1:56",
      bounceRate: "38.7%",
    },
    {
      page: "/about",
      pageViews: 6723,
      uniqueViews: 5901,
      avgTimeOnPage: "3:12",
      bounceRate: "29.4%",
    },
    {
      page: "/contact",
      pageViews: 4567,
      uniqueViews: 4123,
      avgTimeOnPage: "1:23",
      bounceRate: "67.8%",
    },
    {
      page: "/blog",
      pageViews: 3456,
      uniqueViews: 3001,
      avgTimeOnPage: "4:45",
      bounceRate: "23.1%",
    },
    {
      page: "/pricing",
      pageViews: 2789,
      uniqueViews: 2456,
      avgTimeOnPage: "2:01",
      bounceRate: "41.6%",
    },
  ]

  const tableData = data || defaultData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          Top Pages
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
            {tableData.map((row, index) => (
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
      </CardContent>
    </Card>
  )
}