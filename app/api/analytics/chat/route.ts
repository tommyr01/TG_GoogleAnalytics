import { NextRequest, NextResponse } from 'next/server'
import { analyticsClient } from '@/lib/analytics-client'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      )
    }
    
    // Check if analytics server is healthy
    const isHealthy = await analyticsClient.checkHealth()
    if (!isHealthy) {
      console.warn('Analytics server is not healthy, falling back to mock response')
      const response = generateFallbackResponse(message)
      return NextResponse.json({ response })
    }
    
    // Process the natural language query with real Google Analytics data
    const response = await analyticsClient.processQuery(message.trim())
    
    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Provide a helpful error message based on the type of error
    let errorMessage = 'Failed to process your analytics query.'
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the analytics server. Please ensure the Google Analytics service is running.'
      } else if (error.message.includes('authentication') || error.message.includes('auth')) {
        errorMessage = 'Authentication issue with Google Analytics. Please check the configuration.'
      } else if (error.message.includes('property') || error.message.includes('GA_PROPERTY_ID')) {
        errorMessage = 'Google Analytics property not found or not accessible. Please verify the property ID.'
      }
    }
    
    // In production, you might want to fall back to mock data or provide a different response
    const fallbackResponse = `I'm sorry, I encountered an issue accessing your Google Analytics data: ${errorMessage}
    
Please try again in a moment, or ask me about specific aspects of your analytics like traffic, pages, devices, or user behavior and I'll do my best to help with the available data.`
    
    return NextResponse.json({ 
      response: fallbackResponse
    })
  }
}

/**
 * Fallback response when analytics server is unavailable
 */
function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  const fallbackPrefix = "⚠️ *Using sample data (Analytics server unavailable)*\n\n"
  
  if (lowerMessage.includes('traffic') || lowerMessage.includes('visitors') || lowerMessage.includes('users')) {
    return fallbackPrefix + "Based on sample analytics data, you've had 24,567 users this month, which represents a 12.5% increase from last month. Your traffic peaks typically occur on Tuesdays and Wednesdays, with the highest traffic coming from organic search (45.2%) followed by direct traffic (28.7%)."
  }
  
  if (lowerMessage.includes('device') || lowerMessage.includes('mobile')) {
    return fallbackPrefix + "Your users are primarily accessing your site from desktop devices (52.3%), followed by mobile (37.4%) and tablet (9.1%). Mobile traffic has been growing steadily, increasing by 15% over the past quarter."
  }
  
  if (lowerMessage.includes('bounce') || lowerMessage.includes('engagement')) {
    return fallbackPrefix + "Your overall bounce rate is 32.4%, which is quite good! Your blog pages have the lowest bounce rate at 23.1%, while your contact page has the highest at 67.8%. Users spend an average of 2 minutes and 34 seconds on your site."
  }
  
  if (lowerMessage.includes('conversion') || lowerMessage.includes('goals')) {
    return fallbackPrefix + "Your conversion rate is currently 3.2%, with the highest converting age group being 25-34 (4.1% conversion rate). The 'Products' page has the highest conversion rate at 5.8%, while social media traffic converts at 2.1%."
  }
  
  if (lowerMessage.includes('page') || lowerMessage.includes('content') || lowerMessage.includes('top')) {
    return fallbackPrefix + "Your top performing pages are: Homepage (15,234 views), Products (8,945 views), and About (6,723 views). The blog section shows strong engagement with an average time on page of 4 minutes and 45 seconds."
  }
  
  if (lowerMessage.includes('source') || lowerMessage.includes('referral') || lowerMessage.includes('channel')) {
    return fallbackPrefix + "Your traffic sources breakdown: Organic Search (45.2%), Direct (28.7%), Social Media (12.4%), Referral (8.9%), and Email (4.8%). Google is your top referrer, driving 38% of your total traffic."
  }
  
  if (lowerMessage.includes('realtime') || lowerMessage.includes('real-time') || lowerMessage.includes('live')) {
    return fallbackPrefix + "Currently showing 23 active users on your site. They're primarily from United States (12 users), Canada (4 users), and United Kingdom (3 users). Most are using desktop devices (15) with mobile (8) users also active."
  }
  
  return fallbackPrefix + "I can help you analyze various aspects of your Google Analytics data including traffic patterns, user behavior, conversion rates, and audience demographics. Could you be more specific about what you'd like to know?\n\nFor example, you can ask about:\n• Traffic and visitor trends\n• Top performing pages\n• Device and browser usage\n• Traffic sources and channels\n• Real-time user activity\n• Engagement metrics"
}