"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Input } from "@/registry/new-york-v4/ui/input"
import { ScrollArea } from "@/registry/new-york-v4/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/registry/new-york-v4/ui/avatar"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  "What are my top performing pages this month?",
  "How has my traffic changed compared to last month?",
  "Which devices are my users primarily using?",
  "What's my conversion rate by age group?",
  "Show me the bounce rate trends",
  "Which traffic sources bring the most engaged users?",
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 **Hello! I\'m your analytics assistant.**\n\nI can help you understand your Google Analytics data with insights about:\n\n• **Traffic patterns** and visitor trends\n• **Top performing pages** and content\n• **Device and browser usage**\n• **Traffic sources** and channels\n• **Real-time user activity**\n• **Engagement metrics** and conversions\n\nFeel free to ask me anything about your analytics data!',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // In a real implementation, this would call the GA analytics agent
      const response = await fetch('/api/analytics/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      let assistantContent = ''
      
      if (!response.ok) {
        // Mock response for demonstration
        assistantContent = generateMockResponse(input)
      } else {
        const data = await response.json()
        assistantContent = data.response
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-teal-600" />
          Analytics Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-teal-600 text-white">
                      {message.role === 'user' ? <User className="size-4" /> : <Bot className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-teal-600 text-white'
                      : 'bg-muted'
                  }`}>
                    <div className="text-sm leading-relaxed">
                      {message.role === 'user' ? (
                        <p className="text-white m-0">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none text-foreground">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({children}) => <p style={{marginBottom: '12px', lineHeight: '1.6', whiteSpace: 'pre-wrap'}}>{children}</p>,
                              ul: ({children}) => <ul style={{marginBottom: '12px', paddingLeft: '20px', listStyleType: 'disc'}}>{children}</ul>,
                              ol: ({children}) => <ol style={{marginBottom: '12px', paddingLeft: '20px', listStyleType: 'decimal'}}>{children}</ol>,
                              li: ({children}) => <li style={{marginBottom: '4px', lineHeight: '1.5'}}>{children}</li>,
                              strong: ({children}) => <strong style={{fontWeight: '600', color: 'inherit'}}>{children}</strong>,
                              em: ({children}) => <em style={{fontStyle: 'italic', opacity: '0.8'}}>{children}</em>,
                              code: ({children}) => <code style={{backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85em', fontFamily: 'monospace'}}>{children}</code>,
                              h1: ({children}) => <h1 style={{fontSize: '1.125rem', fontWeight: '700', marginBottom: '12px', marginTop: '16px', lineHeight: '1.4'}}>{children}</h1>,
                              h2: ({children}) => <h2 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '12px', marginTop: '16px', lineHeight: '1.4'}}>{children}</h2>,
                              h3: ({children}) => <h3 style={{fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', marginTop: '12px', lineHeight: '1.4'}}>{children}</h3>,
                              blockquote: ({children}) => <blockquote style={{borderLeft: '4px solid #d1d5db', paddingLeft: '16px', paddingTop: '8px', paddingBottom: '8px', fontStyle: 'italic', backgroundColor: '#f9fafb', borderRadius: '0 4px 4px 0'}}>{children}</blockquote>,
                              br: () => <br />,
                              // Ensure line breaks are preserved
                              div: ({children}) => <div style={{marginBottom: '8px'}}>{children}</div>
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-teal-600 text-white">
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Analyzing your data...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t">
            <p className="text-sm font-medium mb-2 text-muted-foreground">Suggested questions:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left h-auto p-2 text-xs justify-start"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your analytics data..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function generateMockResponse(input: string): string {
  const lowerInput = input.toLowerCase()
  
  if (lowerInput.includes('traffic') || lowerInput.includes('visitors')) {
    return "📊 **Traffic Analysis**\n\nBased on your analytics data:\n\n• **24,567 users** this month (↑ **12.5%** from last month)\n• Peak traffic on **Tuesdays and Wednesdays**\n• **Top traffic sources:**\n  - Organic search: **45.2%**\n  - Direct traffic: **28.7%**\n  - Referral: **15.4%**\n  - Social media: **11.7%**"
  }
  
  if (lowerInput.includes('device') || lowerInput.includes('mobile')) {
    return "📱 **Device Usage Breakdown**\n\n• **Desktop**: 52.3% of users\n• **Mobile**: 37.4% of users\n• **Tablet**: 9.1% of users\n• **Growth**: Mobile traffic ↑ **15%** this quarter\n\n*Mobile optimization is becoming increasingly important for your audience.*"
  }
  
  if (lowerInput.includes('bounce') || lowerInput.includes('engagement')) {
    return "⏱️ **Engagement Metrics**\n\n• **Overall bounce rate**: 32.4% *(quite good!)*\n• **Average session duration**: 2 min 34 sec\n\n**By page type:**\n• Blog pages: **23.1%** bounce rate\n• Product pages: **28.9%** bounce rate\n• Contact page: **67.8%** bounce rate\n\n*Your blog content is particularly engaging to visitors.*"
  }
  
  if (lowerInput.includes('conversion') || lowerInput.includes('goals')) {
    return "🎯 **Conversion Analysis**\n\n• **Overall conversion rate**: 3.2%\n• **Best converting age group**: 25-34 (**4.1%**)\n\n**By page:**\n• Products page: **5.8%** conversion rate\n• Homepage: **3.1%** conversion rate\n• Blog posts: **1.9%** conversion rate\n\n**By traffic source:**\n• Email campaigns: **4.2%**\n• Organic search: **3.8%**\n• Social media: **2.1%**"
  }
  
  if (lowerInput.includes('page') || lowerInput.includes('content')) {
    return "📄 **Top Performing Pages**\n\n1. **Homepage** - 15,234 views\n2. **Products** - 8,945 views\n3. **About** - 6,723 views\n4. **Blog Posts** - 5,432 views\n5. **Contact** - 3,210 views\n\n**Blog Performance:**\n• Average time on page: **4 min 45 sec**\n• Strong engagement with technical content\n• *Consider expanding your blog strategy*"
  }
  
  if (lowerInput.includes('source') || lowerInput.includes('referral')) {
    return "🌐 **Traffic Sources Breakdown**\n\n• **Organic Search**: 45.2%\n• **Direct**: 28.7%\n• **Social Media**: 12.4%\n• **Referral**: 8.9%\n• **Email**: 4.8%\n\n**Top Referrers:**\n1. **Google** - 38% of total traffic\n2. **Facebook** - 8.2%\n3. **LinkedIn** - 3.1%\n4. **Twitter** - 1.1%\n\n*Your SEO strategy is working well!*"
  }
  
  return "🤖 I can help you analyze various aspects of your Google Analytics data:\n\n• **Traffic patterns** and visitor trends\n• **User behavior** and engagement\n• **Conversion rates** and goals\n• **Audience demographics**\n\nCould you be more specific about what you'd like to know?"
}