"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Button } from "@/registry/new-york-v4/ui/button"
import { Input } from "@/registry/new-york-v4/ui/input"
import { ScrollArea } from "@/registry/new-york-v4/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/registry/new-york-v4/ui/avatar"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/registry/new-york-v4/ui/tooltip"
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
  const API_URL = process.env.NEXT_PUBLIC_ANALYTICS_SERVER_URL || 'http://localhost:3000'
  
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
      // Call the GA analytics agent through the MCP server
      const response = await fetch(`${API_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      })

      let assistantContent = ''
      
      if (!response.ok) {
        assistantContent = `Sorry, I encountered an error while analyzing your data (${response.status} ${response.statusText}). Please try rephrasing your question or try again later.`
      } else {
        const data = await response.json()
        assistantContent = data.aiResponse || data.response || 'I received your question but couldn\'t generate a proper response. Please try again.'
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
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-teal-600" />
            Analytics Assistant
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Ask questions about your Google Analytics data in natural language. Get insights about traffic patterns, user behavior, conversions, and more.</p>
              </TooltipContent>
            </Tooltip>
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
                        <div className="chat-message-content">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => (
                                <p className="chat-paragraph">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="chat-list chat-list-bulleted">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="chat-list chat-list-numbered">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="chat-list-item">{children}</li>
                              ),
                              strong: ({ children }) => (
                                <strong className="chat-strong">{children}</strong>
                              ),
                              em: ({ children }) => (
                                <em className="chat-emphasis">{children}</em>
                              ),
                              code: ({ children }) => (
                                <code className="chat-code">{children}</code>
                              ),
                              h1: ({ children }) => (
                                <h1 className="chat-heading chat-heading-1">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="chat-heading chat-heading-2">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="chat-heading chat-heading-3">{children}</h3>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="chat-blockquote">{children}</blockquote>
                              ),
                              br: () => <br className="chat-break" />
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
    </TooltipProvider>
  )
}

