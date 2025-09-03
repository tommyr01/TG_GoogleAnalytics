"use client"

import { useState } from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Input } from "@/registry/new-york-v4/ui/input"
import { ScrollArea } from "@/registry/new-york-v4/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/registry/new-york-v4/ui/avatar"

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
      content: 'Hello! I\'m your analytics assistant. Ask me anything about your Google Analytics data. I can help you understand your traffic, audience, conversions, and more.',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
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
    return "Based on your analytics data, you've had 24,567 users this month, which represents a 12.5% increase from last month. Your traffic peaks typically occur on Tuesdays and Wednesdays, with the highest traffic coming from organic search (45.2%) followed by direct traffic (28.7%)."
  }
  
  if (lowerInput.includes('device') || lowerInput.includes('mobile')) {
    return "Your users are primarily accessing your site from desktop devices (52.3%), followed by mobile (37.4%) and tablet (9.1%). Mobile traffic has been growing steadily, increasing by 15% over the past quarter."
  }
  
  if (lowerInput.includes('bounce') || lowerInput.includes('engagement')) {
    return "Your overall bounce rate is 32.4%, which is quite good! Your blog pages have the lowest bounce rate at 23.1%, while your contact page has the highest at 67.8%. Users spend an average of 2 minutes and 34 seconds on your site."
  }
  
  if (lowerInput.includes('conversion') || lowerInput.includes('goals')) {
    return "Your conversion rate is currently 3.2%, with the highest converting age group being 25-34 (4.1% conversion rate). The 'Products' page has the highest conversion rate at 5.8%, while social media traffic converts at 2.1%."
  }
  
  if (lowerInput.includes('page') || lowerInput.includes('content')) {
    return "Your top performing pages are: Homepage (15,234 views), Products (8,945 views), and About (6,723 views). The blog section shows strong engagement with an average time on page of 4 minutes and 45 seconds."
  }
  
  if (lowerInput.includes('source') || lowerInput.includes('referral')) {
    return "Your traffic sources breakdown: Organic Search (45.2%), Direct (28.7%), Social Media (12.4%), Referral (8.9%), and Email (4.8%). Google is your top referrer, driving 38% of your total traffic."
  }
  
  return "I can help you analyze various aspects of your Google Analytics data including traffic patterns, user behavior, conversion rates, and audience demographics. Could you be more specific about what you'd like to know?"
}