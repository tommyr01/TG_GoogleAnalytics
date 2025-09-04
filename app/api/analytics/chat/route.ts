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
    const fallbackResponse = `Oops! 😅 I hit a snag while fetching your analytics data: ${errorMessage}\n\nNo worries though! This happens sometimes. Here's what you can try:\n\n🔄 **Give it another shot** - Sometimes it's just a temporary hiccup\n📊 **Ask about specific metrics** - Try questions like \"How's my traffic?\" or \"Show me my top pages\"\n🕰️ **Check back in a moment** - The analytics server might just need a quick breather\n\nI'm still here to help analyze your data once we get reconnected! What would you like to explore? 🚀`
    
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
    return fallbackPrefix + "Hey! 🚀 Your traffic is looking solid this month!\n\n📊 **Here's what I found:**\n\n• You had **24,567 users** visit your site - that's a fantastic **12.5% increase** from last month! 📈\n\n• Your busiest days are **Tuesdays and Wednesdays** - perfect for launching new content!\n\n**Traffic breakdown:**\n\n• **Organic search**: 45.2% (great SEO work! 👏)\n• **Direct traffic**: 28.7% (strong brand recognition)\n• **Referral traffic**: 15.4% (partnerships paying off)\n• **Social media**: 11.7% (room for growth here!)\n\n💡 **Quick tip**: Your organic search is performing well above the 40% benchmark - whatever SEO strategy you're using, keep it up!\n\nWant me to dive deeper into any specific traffic source?"
  }
  
  if (lowerMessage.includes('device') || lowerMessage.includes('mobile')) {
    return fallbackPrefix + "📱 **Device Usage Breakdown**\n\n• **Desktop**: 52.3% of users\n• **Mobile**: 37.4% of users\n• **Tablet**: 9.1% of users\n• **Growth**: Mobile traffic ↑ **15%** this quarter\n\n*Mobile optimization is becoming increasingly important for your audience.*"
  }
  
  if (lowerMessage.includes('bounce') || lowerMessage.includes('engagement')) {
    return fallbackPrefix + "Great news about your engagement! 🎆\n\n⏱️ **Your audience is staying engaged:**\n\n• **Overall bounce rate**: 32.4% - This is excellent! Most sites see 40-60%, so you're doing something right! 👏\n\n• **Average session duration**: 2 min 34 sec - People are genuinely interested in your content!\n\n**Page performance breakdown:**\n\n• **Blog pages**: 23.1% bounce rate 💪 (amazing!)\n• **Product pages**: 28.9% bounce rate ✅ (solid performance)\n• **Contact page**: 67.8% bounce rate 📋 (normal - people get info and leave)\n\n💡 **What this means**: Your blog content is a real winner! It's keeping visitors engaged and encouraging them to explore more pages. Consider promoting your blog posts more prominently.\n\nWant me to suggest ways to improve engagement on your product pages?"
  }
  
  if (lowerMessage.includes('conversion') || lowerMessage.includes('goals')) {
    return fallbackPrefix + "🎯 **Conversion Analysis**\n\n• **Overall conversion rate**: 3.2%\n\n• **Best converting age group**: 25-34 (**4.1%**)\n\n**By page:**\n\n• Products page: **5.8%** conversion rate\n• Homepage: **3.1%** conversion rate\n• Blog posts: **1.9%** conversion rate\n\n**By traffic source:**\n\n• Email campaigns: **4.2%**\n• Organic search: **3.8%**\n• Social media: **2.1%**"
  }
  
  if (lowerMessage.includes('page') || lowerMessage.includes('content') || lowerMessage.includes('top')) {
    return fallbackPrefix + "📄 **Top Performing Pages**\n\n1. **Homepage** - 15,234 views\n\n2. **Products** - 8,945 views\n\n3. **About** - 6,723 views\n\n4. **Blog Posts** - 5,432 views\n\n5. **Contact** - 3,210 views\n\n**Blog Performance:**\n\n• Average time on page: **4 min 45 sec**\n• Strong engagement with technical content\n• *Consider expanding your blog strategy*"
  }
  
  if (lowerMessage.includes('source') || lowerMessage.includes('referral') || lowerMessage.includes('channel')) {
    return fallbackPrefix + "🌐 **Traffic Sources Breakdown**\n\n• **Organic Search**: 45.2%\n• **Direct**: 28.7%\n• **Social Media**: 12.4%\n• **Referral**: 8.9%\n• **Email**: 4.8%\n\n**Top Referrers:**\n\n1. **Google** - 38% of total traffic\n\n2. **Facebook** - 8.2%\n\n3. **LinkedIn** - 3.1%\n\n4. **Twitter** - 1.1%\n\n*Your SEO strategy is working well!*"
  }
  
  if (lowerMessage.includes('realtime') || lowerMessage.includes('real-time') || lowerMessage.includes('live')) {
    return fallbackPrefix + "🔴 **Real-time Analytics**\n\n• **23 active users** on your site right now\n\n**Geographic breakdown:**\n\n• United States: **12 users**\n• Canada: **4 users**\n• United Kingdom: **3 users**\n• Other countries: **4 users**\n\n**Device usage (live):**\n\n• Desktop: **15 users**\n• Mobile: **8 users**\n\n*Activity is strongest on your homepage and product pages.*"
  }
  
  return fallbackPrefix + "Hey there! 😊 I'm your Google Analytics assistant, and I'm here to help you make sense of your data!\n\n📊 **I can dive deep into:**\n\n• **Traffic patterns** - Who's visiting and when\n• **User behavior** - What keeps people engaged\n• **Conversion insights** - What's driving results\n• **Audience insights** - Who your visitors really are\n\n💡 **Try asking me things like:**\n\n• \"How's my traffic doing this month?\"\n• \"Which pages are performing best?\"\n• \"Are people staying engaged with my content?\"\n• \"What devices are my users on?\"\n• \"Show me my real-time visitors!\"\n\nI love turning boring numbers into actionable insights that can grow your business! What would you like to explore first? 🚀"
}