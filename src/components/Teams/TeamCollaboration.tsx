import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Send, AtSign, Hash, Bell, Heart, MessageCircle,
  CheckCircle2, Clock, AlertCircle, Image, Paperclip,
  ThumbsUp, Eye, Star, MoreHorizontal, Reply, Edit, Trash2,
  Filter, Search, TrendingUp, Award, Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'

interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
  status: 'online' | 'away' | 'offline'
}

interface Activity {
  id: string
  type: 'comment' | 'task_complete' | 'task_assigned' | 'mention' | 'file_upload' | 'status_change' | 'achievement'
  user: TeamMember
  content: string
  timestamp: Date
  targetId?: string
  targetTitle?: string
  mentions?: TeamMember[]
  reactions?: { emoji: string; users: string[] }[]
  replies?: Activity[]
  attachments?: string[]
}

interface Message {
  id: string
  user: TeamMember
  content: string
  timestamp: Date
  mentions: TeamMember[]
  reactions: { emoji: string; users: string[] }[]
  isEdited?: boolean
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', avatar: 'SJ', role: 'Project Manager', status: 'online' },
  { id: '2', name: 'Michael Chen', avatar: 'MC', role: 'Lead Developer', status: 'online' },
  { id: '3', name: 'Emma Wilson', avatar: 'EW', role: 'Designer', status: 'away' },
  { id: '4', name: 'James Martinez', avatar: 'JM', role: 'Developer', status: 'offline' },
  { id: '5', name: 'Lisa Anderson', avatar: 'LA', role: 'QA Engineer', status: 'online' }
]

const ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'task_complete',
    user: TEAM_MEMBERS[0],
    content: 'completed the task "Update landing page design"',
    timestamp: new Date(Date.now() - 5 * 60000),
    targetId: 'task-1',
    targetTitle: 'Update landing page design',
    reactions: [
      { emoji: '👍', users: ['2', '3'] },
      { emoji: '🎉', users: ['4'] }
    ]
  },
  {
    id: '2',
    type: 'mention',
    user: TEAM_MEMBERS[1],
    content: '@Emma Wilson can you review the new component designs?',
    timestamp: new Date(Date.now() - 15 * 60000),
    mentions: [TEAM_MEMBERS[2]],
    reactions: []
  },
  {
    id: '3',
    type: 'task_assigned',
    user: TEAM_MEMBERS[0],
    content: 'assigned "API integration" to @Michael Chen',
    timestamp: new Date(Date.now() - 30 * 60000),
    targetId: 'task-2',
    targetTitle: 'API integration',
    mentions: [TEAM_MEMBERS[1]],
    reactions: []
  },
  {
    id: '4',
    type: 'comment',
    user: TEAM_MEMBERS[2],
    content: 'The new dashboard looks great! I\'ve added some accessibility improvements.',
    timestamp: new Date(Date.now() - 60 * 60000),
    reactions: [
      { emoji: '❤️', users: ['1', '2', '5'] }
    ]
  },
  {
    id: '5',
    type: 'achievement',
    user: TEAM_MEMBERS[3],
    content: 'earned the "Code Warrior" badge for completing 50 tasks!',
    timestamp: new Date(Date.now() - 90 * 60000),
    reactions: [
      { emoji: '🎉', users: ['1', '2', '3', '5'] },
      { emoji: '🏆', users: ['1'] }
    ]
  },
  {
    id: '6',
    type: 'status_change',
    user: TEAM_MEMBERS[4],
    content: 'moved "User authentication bug" from In Progress to Done',
    timestamp: new Date(Date.now() - 120 * 60000),
    targetId: 'task-3',
    targetTitle: 'User authentication bug',
    reactions: []
  }
]

export function TeamCollaboration() {
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [selectedTab, setSelectedTab] = useState('feed')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'comment': return MessageCircle
      case 'task_complete': return CheckCircle2
      case 'task_assigned': return Users
      case 'mention': return AtSign
      case 'file_upload': return Paperclip
      case 'status_change': return TrendingUp
      case 'achievement': return Award
      default: return Bell
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'task_complete': return 'text-green-500 bg-green-500/10'
      case 'task_assigned': return 'text-blue-500 bg-blue-500/10'
      case 'mention': return 'text-purple-500 bg-purple-500/10'
      case 'achievement': return 'text-yellow-500 bg-yellow-500/10'
      case 'status_change': return 'text-orange-500 bg-orange-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessageInput(value)

    // Check for @ mention trigger
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1)
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt)
        setShowMentions(true)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const handleMentionSelect = (member: TeamMember) => {
    const lastAtIndex = messageInput.lastIndexOf('@')
    const beforeMention = messageInput.slice(0, lastAtIndex)
    const newValue = `${beforeMention}@${member.name} `
    setMessageInput(newValue)
    setShowMentions(false)
    inputRef.current?.focus()
  }

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    // Extract mentions
    const mentionedMembers: TeamMember[] = []
    const mentionRegex = /@(\w+\s*\w*)/g
    let match
    while ((match = mentionRegex.exec(messageInput)) !== null) {
      const member = TEAM_MEMBERS.find(m => m.name.toLowerCase().includes(match[1].toLowerCase()))
      if (member && !mentionedMembers.find(m => m.id === member.id)) {
        mentionedMembers.push(member)
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      user: TEAM_MEMBERS[0], // Current user
      content: messageInput,
      timestamp: new Date(),
      mentions: mentionedMembers,
      reactions: []
    }

    setMessages(prev => [...prev, newMessage])
    setMessageInput('')
  }

  const handleReaction = (activityId: string, emoji: string) => {
    setActivities(prev =>
      prev.map(activity => {
        if (activity.id === activityId) {
          const existingReaction = activity.reactions?.find(r => r.emoji === emoji)
          if (existingReaction) {
            // Toggle user's reaction
            const hasReacted = existingReaction.users.includes('1') // Current user ID
            return {
              ...activity,
              reactions: activity.reactions?.map(r =>
                r.emoji === emoji
                  ? {
                      ...r,
                      users: hasReacted
                        ? r.users.filter(id => id !== '1')
                        : [...r.users, '1']
                    }
                  : r
              )
            }
          } else {
            // Add new reaction
            return {
              ...activity,
              reactions: [...(activity.reactions || []), { emoji, users: ['1'] }]
            }
          }
        }
        return activity
      })
    )
  }

  const filteredMembers = TEAM_MEMBERS.filter(member =>
    member.name.toLowerCase().includes(mentionSearch.toLowerCase())
  )

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Collaboration</h1>
          <p className="text-muted-foreground">Stay connected with your team and track project activities</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Feed</CardTitle>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList>
                    <TabsTrigger value="feed">All</TabsTrigger>
                    <TabsTrigger value="mentions">Mentions</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {activities
                    .filter(activity => {
                      if (selectedTab === 'mentions') return activity.type === 'mention'
                      if (selectedTab === 'tasks') return activity.type === 'task_complete' || activity.type === 'task_assigned'
                      return true
                    })
                    .map((activity, index) => {
                      const Icon = getActivityIcon(activity.type)
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-lg border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                {activity.user.avatar}
                              </AvatarFallback>
                            </Avatar>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div>
                                  <span className="font-semibold">{activity.user.name}</span>
                                  <span className="text-muted-foreground text-sm ml-2">
                                    {activity.content}
                                  </span>
                                </div>
                                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                              </div>

                              {activity.targetTitle && (
                                <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded inline-block mb-2">
                                  {activity.targetTitle}
                                </div>
                              )}

                              {/* Reactions */}
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                  {activity.reactions && activity.reactions.length > 0 ? (
                                    <div className="flex items-center gap-1">
                                      {activity.reactions.map(reaction => (
                                        <button
                                          key={reaction.emoji}
                                          onClick={() => handleReaction(activity.id, reaction.emoji)}
                                          className={`px-2 py-1 rounded-full text-sm hover:bg-muted transition-colors ${
                                            reaction.users.includes('1') ? 'bg-primary/10' : 'bg-muted/50'
                                          }`}
                                        >
                                          {reaction.emoji} {reaction.users.length}
                                        </button>
                                      ))}
                                    </div>
                                  ) : null}
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8">
                                        <Heart className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      {['👍', '❤️', '🎉', '🚀', '👏', '🔥'].map(emoji => (
                                        <DropdownMenuItem
                                          key={emoji}
                                          onClick={() => handleReaction(activity.id, emoji)}
                                        >
                                          <span className="text-xl">{emoji}</span>
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <Button variant="ghost" size="sm" className="h-8">
                                  <Reply className="h-4 w-4 mr-1" />
                                  Reply
                                </Button>

                                <span className="text-xs text-muted-foreground ml-auto">
                                  {getTimeAgo(activity.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Input */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Textarea
                  ref={inputRef}
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Share an update, @mention teammates..."
                  className="min-h-[100px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSendMessage()
                    }
                  }}
                />

                {/* Mention Suggestions */}
                <AnimatePresence>
                  {showMentions && filteredMembers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-lg shadow-lg overflow-hidden z-10"
                    >
                      <div className="p-2 space-y-1">
                        {filteredMembers.map(member => (
                          <button
                            key={member.id}
                            onClick={() => handleMentionSelect(member)}
                            className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-left"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                                {member.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{member.name}</div>
                              <div className="text-xs text-muted-foreground">{member.role}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <AtSign className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Post Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Members</CardTitle>
              <CardDescription>{TEAM_MEMBERS.length} members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {TEAM_MEMBERS.map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                        member.status === 'online'
                          ? 'bg-green-500'
                          : member.status === 'away'
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{member.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{member.role}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Tasks Completed</span>
                </div>
                <span className="font-bold">127</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="font-bold">18</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Comments</span>
                </div>
                <span className="font-bold">342</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Streak</span>
                </div>
                <span className="font-bold">12 days</span>
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Trending
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['#design-review', '#sprint-planning', '#bug-fixes', '#feature-launch'].map(tag => (
                <button
                  key={tag}
                  className="w-full p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left text-sm"
                >
                  {tag}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
