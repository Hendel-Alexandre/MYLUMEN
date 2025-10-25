import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Send, Loader2, X, Calendar, Clock, 
  Tag, User, AlertCircle, CheckCircle2, Lightbulb,
  TrendingUp, Brain
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: TaskSuggestion[]
  insights?: string[]
}

interface TaskSuggestion {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  dueDate?: Date
  estimatedTime?: number
  tags?: string[]
  assignee?: string
}

const SAMPLE_INSIGHTS = [
  "You're most productive between 9 AM - 11 AM. Schedule complex tasks during this time.",
  "Your task completion rate is 85% this week - great job!",
  "You have 3 overdue tasks. Consider delegating or rescheduling.",
  "Similar tasks typically take you 2.5 hours. Plan accordingly."
]

const QUICK_PROMPTS = [
  "Create a task for tomorrow",
  "What should I focus on today?",
  "Analyze my productivity",
  "Suggest task priorities"
]

export function SmartTaskAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const parseNaturalLanguage = (text: string): TaskSuggestion[] => {
    const suggestions: TaskSuggestion[] = []
    const lowerText = text.toLowerCase()

    // Example parsing logic (in production, this would use OpenAI API)
    
    // Detect task creation intent
    if (lowerText.includes('create') || lowerText.includes('add') || lowerText.includes('new task')) {
      const suggestion: TaskSuggestion = {
        title: text.replace(/create|add|new task/gi, '').trim()
      }

      // Extract priority
      if (lowerText.includes('urgent') || lowerText.includes('important') || lowerText.includes('high priority')) {
        suggestion.priority = 'high'
      } else if (lowerText.includes('low priority')) {
        suggestion.priority = 'low'
      } else {
        suggestion.priority = 'medium'
      }

      // Extract time references
      if (lowerText.includes('tomorrow')) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        suggestion.dueDate = tomorrow
      } else if (lowerText.includes('next week')) {
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        suggestion.dueDate = nextWeek
      } else if (lowerText.includes('today')) {
        suggestion.dueDate = new Date()
      }

      // Extract time estimates
      const timeMatch = text.match(/(\d+)\s*(hour|hr|minute|min)/i)
      if (timeMatch) {
        const value = parseInt(timeMatch[1])
        const unit = timeMatch[2].toLowerCase()
        suggestion.estimatedTime = unit.includes('hour') || unit.includes('hr') 
          ? value * 60 
          : value
      }

      // Extract assignee
      const assigneeMatch = text.match(/assign to\s+(\w+)/i)
      if (assigneeMatch) {
        suggestion.assignee = assigneeMatch[1]
      }

      suggestions.push(suggestion)
    }

    return suggestions
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI processing
    setTimeout(() => {
      const suggestions = parseNaturalLanguage(input)
      
      let responseContent = ''
      let insights: string[] = []

      if (suggestions.length > 0) {
        responseContent = "I've analyzed your request and created the following task suggestions:"
      } else if (input.toLowerCase().includes('productivity') || input.toLowerCase().includes('analyze')) {
        responseContent = "Here's your productivity analysis for this week:"
        insights = SAMPLE_INSIGHTS
      } else if (input.toLowerCase().includes('focus') || input.toLowerCase().includes('should i')) {
        responseContent = "Based on your current workload and priorities, here's what I recommend:"
        insights = [
          "Start with your 3 high-priority tasks",
          "Block 2 hours for deep work on Project Alpha",
          "Schedule team sync for this afternoon",
          "Review pending client feedback"
        ]
      } else {
        responseContent = "I can help you with:\n• Creating tasks from natural language\n• Analyzing your productivity patterns\n• Suggesting task priorities\n• Optimizing your schedule\n\nTry asking me to create a task or analyze your productivity!"
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        insights: insights.length > 0 ? insights : undefined
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const handleCreateTask = (suggestion: TaskSuggestion) => {
    // In production, this would create an actual task
    console.log('Creating task:', suggestion)
    alert(`Task created: ${suggestion.title}`)
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
      >
        <Sparkles className="h-6 w-6" />
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-400"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md"
          >
            <Card className="shadow-2xl border-2">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">AI Assistant</h3>
                      <p className="text-xs text-white/80">Powered by LumenR Intelligence</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="h-96 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                      </motion.div>
                      <h4 className="font-semibold mb-2">Hello! I'm your AI assistant</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        I can help you create tasks, analyze productivity, and optimize your workflow.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {QUICK_PROMPTS.map(prompt => (
                          <Button
                            key={prompt}
                            onClick={() => handleQuickPrompt(prompt)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                        {message.type === 'assistant' && (
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Sparkles className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-xs font-medium">AI Assistant</span>
                          </div>
                        )}
                        
                        <div className={`rounded-2xl px-4 py-2 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                        </div>

                        {/* Task Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.suggestions.map((suggestion, idx) => (
                              <Card key={idx} className="border-2 border-primary/20">
                                <CardContent className="p-3">
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                                      {suggestion.priority && (
                                        <Badge 
                                          variant={
                                            suggestion.priority === 'high' ? 'destructive' :
                                            suggestion.priority === 'medium' ? 'default' :
                                            'secondary'
                                          }
                                          className="text-xs"
                                        >
                                          {suggestion.priority}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {suggestion.description && (
                                      <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                                    )}
                                    
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                      {suggestion.dueDate && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {suggestion.dueDate.toLocaleDateString()}
                                        </div>
                                      )}
                                      {suggestion.estimatedTime && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {suggestion.estimatedTime}m
                                        </div>
                                      )}
                                      {suggestion.assignee && (
                                        <div className="flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          {suggestion.assignee}
                                        </div>
                                      )}
                                    </div>

                                    <Button
                                      onClick={() => handleCreateTask(suggestion)}
                                      size="sm"
                                      className="w-full"
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Create Task
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* Insights */}
                        {message.insights && message.insights.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.insights.map((insight, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20"
                              >
                                <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs">{insight}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything or create a task..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Try: "Create a high priority task for tomorrow at 2pm"
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
