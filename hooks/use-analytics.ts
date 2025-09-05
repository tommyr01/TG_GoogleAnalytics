"use client"

import { useState, useEffect } from 'react'
import { useDateRange } from '@/contexts/date-range-context'

interface AnalyticsData {
  overview: {
    sessions: number
    totalUsers: number
    pageViews: number
    avgSessionDuration: string
    bounceRate: string
    engagementRate: string
  } | null
  traffic: Array<{
    date: string
    users: number
    pageViews: number
    sessions: number
  }>
  audience: Array<{
    ageGroup: string
    users: number
    percentage: number
  }>
  devices: Array<{
    device: string
    users: number
    percentage: number
  }>
  topPages: Array<{
    page: string
    pageViews: number
    uniqueViews: number
    avgTimeOnPage: string
    bounceRate: string
  }>
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    overview: null,
    traffic: [],
    audience: [],
    devices: [],
    topPages: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  const { getEffectiveDateRange, selectedRange, customRange } = useDateRange()

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setIsLoading(true)
        setError(null)
        
        const dateRange = getEffectiveDateRange()
        const dateRangeParam = selectedRange === 'custom' && customRange 
          ? `custom:${dateRange.startDate}:${dateRange.endDate}`
          : selectedRange

        // Fetch data from GA MCP server with date range
        const apiCalls = [
          fetch(`http://localhost:3000/api/summary?dateRange=${dateRangeParam}`),
          fetch(`http://localhost:3000/api/pages?dateRange=${dateRangeParam}&limit=10`),
          fetch(`http://localhost:3000/api/devices?dateRange=${dateRangeParam}`),
          fetch(`http://localhost:3000/api/daily-traffic?dateRange=${dateRangeParam}`),
          fetch(`http://localhost:3000/api/demographics?dateRange=${dateRangeParam}`)
        ]
        
        const [summaryResponse, pagesResponse, devicesResponse, dailyTrafficResponse, demographicsResponse] = await Promise.all(apiCalls)
        
        if (!summaryResponse.ok) {
          throw new Error(`Failed to fetch analytics summary: ${summaryResponse.statusText}`)
        }
        
        const summaryData = await summaryResponse.json()
        const pagesData = pagesResponse.ok ? await pagesResponse.json() : { pages: [] }
        const devicesData = devicesResponse.ok ? await devicesResponse.json() : { devices: [] }
        const dailyTrafficData = dailyTrafficResponse.ok ? await dailyTrafficResponse.json() : { dailyData: [] }
        const demographicsData = demographicsResponse.ok ? await demographicsResponse.json() : { demographics: { age: [], hasData: false } }
        
        // Transform GA4 data to match our interface - NO FALLBACKS TO MOCK DATA
        const transformedData: AnalyticsData = {
          overview: summaryData.metrics ? {
            sessions: summaryData.metrics.sessions || 0,
            totalUsers: summaryData.metrics.activeUsers || 0,
            pageViews: summaryData.metrics.pageViews || 0,
            avgSessionDuration: summaryData.metrics.avgSessionDuration 
              ? `${Math.floor(summaryData.metrics.avgSessionDuration / 60)}m ${Math.floor(summaryData.metrics.avgSessionDuration % 60)}s`
              : '0m 0s',
            bounceRate: `${((summaryData.metrics.bounceRate || 0) * 100).toFixed(1)}%`,
            engagementRate: `${((summaryData.metrics.engagementRate || 0) * 100).toFixed(1)}%`,
          } : null,
          
          traffic: dailyTrafficData.dailyData || [],
          
          // Use demographics data if available, otherwise empty array
          audience: demographicsData.demographics?.hasData 
            ? demographicsData.demographics.age 
            : [],
          
          // Use real device data if available, otherwise empty array
          devices: devicesData.devices?.length > 0 
            ? devicesData.devices.slice(0, 4).map((device: any) => {
                const totalUsers = summaryData.metrics.activeUsers || 1 // Avoid division by zero
                return {
                  device: device.deviceCategory || 'Unknown',
                  users: device.users || 0,
                  percentage: parseFloat(((device.users / totalUsers) * 100).toFixed(1))
                }
              })
            : [],
          
          // Use real pages data if available, otherwise empty array
          topPages: pagesData.pages?.length > 0 
            ? pagesData.pages.slice(0, 6).map((page: any) => ({
                page: page.path || '',
                pageViews: page.views || 0,
                uniqueViews: page.users || 0,
                avgTimeOnPage: page.avgDuration 
                  ? `${Math.floor(page.avgDuration / 60)}:${String(Math.floor(page.avgDuration % 60)).padStart(2, '0')}`
                  : '0:00',
                bounceRate: `${((page.bounceRate || 0) * 100).toFixed(1)}%`,
              }))
            : [],
        }
        
        setData(transformedData)
        setIsConnected(true)
      } catch (err) {
        console.error('Failed to fetch analytics data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load analytics data')
        setIsConnected(false)
        
        // DO NOT PROVIDE MOCK DATA - set empty state
        setData({
          overview: null,
          traffic: [],
          audience: [],
          devices: [],
          topPages: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [selectedRange, customRange, getEffectiveDateRange]) // Re-fetch when date range changes

  return { data, isLoading, error, isConnected }
}