"use client"

import { useState, useEffect } from 'react'

interface AnalyticsData {
  overview: {
    totalUsers: number
    pageViews: number
    avgSessionDuration: string
    bounceRate: string
    userChange: string
    pageViewsChange: string
    sessionChange: string
    bounceChange: string
  }
  traffic: Array<{
    date: string
    users: number
    pageViews: number
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
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setIsLoading(true)
        
        // Try to fetch from GA MCP server
        const response = await fetch('http://localhost:3000/analytics/overview')
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        
        const analyticsData = await response.json()
        setData(analyticsData)
        setError(null)
      } catch (err) {
        console.warn('Failed to fetch from MCP server, using mock data:', err)
        
        // Use mock data if MCP server is not available
        const mockData: AnalyticsData = {
          overview: {
            totalUsers: 24567,
            pageViews: 89234,
            avgSessionDuration: "2m 34s",
            bounceRate: "32.4%",
            userChange: "+12.5%",
            pageViewsChange: "+8.2%",
            sessionChange: "+5.7%",
            bounceChange: "-2.1%",
          },
          traffic: generateTrafficData(),
          audience: generateAudienceData(),
          devices: generateDeviceData(),
          topPages: generateTopPagesData(),
        }
        
        setData(mockData)
        setError(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  return { data, isLoading, error }
}

function generateTrafficData() {
  const data = []
  const now = new Date()
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const dayName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const baseUsers = 2000 + Math.random() * 6000
    const basePageViews = baseUsers * (1.5 + Math.random() * 1.5)
    
    data.push({
      date: dayName,
      users: Math.round(baseUsers),
      pageViews: Math.round(basePageViews),
    })
  }
  
  return data
}

function generateAudienceData() {
  return [
    { ageGroup: "18-24", users: 3245, percentage: 18.2 },
    { ageGroup: "25-34", users: 8901, percentage: 35.6 },
    { ageGroup: "35-44", users: 6234, percentage: 24.8 },
    { ageGroup: "45-54", users: 3456, percentage: 13.8 },
    { ageGroup: "55-64", users: 1567, percentage: 6.2 },
    { ageGroup: "65+", users: 890, percentage: 3.6 },
  ]
}

function generateDeviceData() {
  return [
    { device: "Desktop", users: 12450, percentage: 52.3 },
    { device: "Mobile", users: 8901, percentage: 37.4 },
    { device: "Tablet", users: 2156, percentage: 9.1 },
    { device: "Other", users: 293, percentage: 1.2 },
  ]
}

function generateTopPagesData() {
  return [
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
}