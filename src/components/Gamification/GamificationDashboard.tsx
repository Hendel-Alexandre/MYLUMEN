import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, Flame, Zap, Star, Award, TrendingUp, 
  Target, CheckCircle2, Clock, Users, Crown,
  ChevronRight, Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  progress: number
  total: number
  xp: number
  unlocked: boolean
  unlockedAt?: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface UserStats {
  totalXP: number
  level: number
  nextLevelXP: number
  currentStreak: number
  longestStreak: number
  tasksCompleted: number
  projectsCompleted: number
  focusHours: number
  badges: string[]
}

interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  avatar: string
  xp: number
  level: number
  tasksCompleted: number
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-task',
    title: 'First Steps',
    description: 'Complete your first task',
    icon: CheckCircle2,
    progress: 1,
    total: 1,
    xp: 10,
    unlocked: true,
    rarity: 'common'
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete a task before 9 AM',
    icon: Clock,
    progress: 1,
    total: 1,
    xp: 25,
    unlocked: true,
    rarity: 'rare'
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete a task after 10 PM',
    icon: Star,
    progress: 0,
    total: 1,
    xp: 25,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'sprint-master',
    title: 'Sprint Master',
    description: 'Complete 10 tasks in one day',
    icon: Zap,
    progress: 7,
    total: 10,
    xp: 50,
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: Flame,
    progress: 5,
    total: 7,
    xp: 100,
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Complete 100 tasks',
    icon: Trophy,
    progress: 67,
    total: 100,
    xp: 200,
    unlocked: false,
    rarity: 'legendary'
  },
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Complete 50 Pomodoro sessions',
    icon: Target,
    progress: 32,
    total: 50,
    xp: 150,
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: 'team-player',
    title: 'Team Player',
    description: 'Collaborate on 25 team projects',
    icon: Users,
    progress: 12,
    total: 25,
    xp: 100,
    unlocked: false,
    rarity: 'rare'
  }
]

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: '1', userName: 'Sarah Johnson', avatar: 'SJ', xp: 5420, level: 24, tasksCompleted: 342 },
  { rank: 2, userId: '2', userName: 'Michael Chen', avatar: 'MC', xp: 4890, level: 22, tasksCompleted: 298 },
  { rank: 3, userId: '3', userName: 'Emma Wilson', avatar: 'EW', xp: 4320, level: 20, tasksCompleted: 276 },
  { rank: 4, userId: '4', userName: 'You', avatar: 'YU', xp: 3850, level: 18, tasksCompleted: 245 },
  { rank: 5, userId: '5', userName: 'James Martinez', avatar: 'JM', xp: 3420, level: 17, tasksCompleted: 221 }
]

export function GamificationDashboard() {
  const [stats, setStats] = useState<UserStats>({
    totalXP: 3850,
    level: 18,
    nextLevelXP: 4200,
    currentStreak: 5,
    longestStreak: 12,
    tasksCompleted: 245,
    projectsCompleted: 18,
    focusHours: 87,
    badges: ['first-task', 'early-bird']
  })

  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS)
  const [showConfetti, setShowConfetti] = useState(false)

  const xpProgress = ((stats.totalXP % 1000) / 1000) * 100
  const unlockedCount = achievements.filter(a => a.unlocked).length

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 bg-gray-500/10'
      case 'rare': return 'text-blue-500 bg-blue-500/10'
      case 'epic': return 'text-purple-500 bg-purple-500/10'
      case 'legendary': return 'text-yellow-500 bg-yellow-500/10'
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Achievements</h1>
        <p className="text-muted-foreground">Track your progress and compete with your team</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <span className="text-xs font-medium text-blue-500">Level {stats.level}</span>
            </div>
            <div className="text-2xl font-bold mb-1">{stats.totalXP.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mb-3">Total XP</div>
            <Progress value={xpProgress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round(xpProgress)}% to Level {stats.level + 1}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              {stats.currentStreak > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Sparkles className="h-4 w-4 text-orange-500" />
                </motion.div>
              )}
            </div>
            <div className="text-2xl font-bold mb-1">{stats.currentStreak} Days</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
            <div className="text-xs text-muted-foreground mt-2">
              Best: {stats.longestStreak} days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1">{stats.tasksCompleted}</div>
            <div className="text-xs text-muted-foreground">Tasks Completed</div>
            <div className="text-xs text-muted-foreground mt-2">
              {stats.projectsCompleted} projects done
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold mb-1">{unlockedCount}/{achievements.length}</div>
            <div className="text-xs text-muted-foreground">Achievements</div>
            <div className="text-xs text-muted-foreground mt-2">
              {Math.round((unlockedCount / achievements.length) * 100)}% complete
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon
              const progressPercent = (achievement.progress / achievement.total) * 100

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    achievement.unlocked ? 'border-primary' : ''
                  }`}>
                    {achievement.unlocked && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-2xl" />
                    )}
                    
                    <CardContent className="p-6 relative">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-xl ${
                          achievement.unlocked 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{achievement.title}</h3>
                            {achievement.unlocked && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Unlocked
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-3">
                            {achievement.description}
                          </p>

                          {/* Progress */}
                          {!achievement.unlocked && (
                            <div className="space-y-2">
                              <Progress value={progressPercent} className="h-2" />
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{achievement.progress} / {achievement.total}</span>
                                <span className="flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  {achievement.xp} XP
                                </span>
                              </div>
                            </div>
                          )}

                          {achievement.unlocked && (
                            <div className="flex items-center justify-between">
                              <Badge className={getRarityColor(achievement.rarity)}>
                                {achievement.rarity}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                +{achievement.xp} XP
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                {MOCK_LEADERBOARD.map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      entry.userName === 'You'
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-8">
                      {getRankBadge(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                      {entry.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {entry.userName}
                        {entry.userName === 'You' && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Level {entry.level} • {entry.tasksCompleted} tasks
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <div className="font-bold">{entry.xp.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">XP</div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                View Full Leaderboard
              </Button>
            </CardContent>
          </Card>

          {/* Streak Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Activity Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => {
                  const hasActivity = Math.random() > 0.3
                  const intensity = hasActivity ? Math.floor(Math.random() * 4) + 1 : 0
                  
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-md transition-all hover:scale-110 ${
                        intensity === 0 ? 'bg-muted' :
                        intensity === 1 ? 'bg-green-200 dark:bg-green-900' :
                        intensity === 2 ? 'bg-green-400 dark:bg-green-700' :
                        intensity === 3 ? 'bg-green-500 dark:bg-green-600' :
                        'bg-green-600 dark:bg-green-500'
                      }`}
                      title={`Day ${i + 1}`}
                    />
                  )
                })}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>Less active</span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-sm ${
                        i === 0 ? 'bg-muted' :
                        i === 1 ? 'bg-green-200 dark:bg-green-900' :
                        i === 2 ? 'bg-green-400 dark:bg-green-700' :
                        i === 3 ? 'bg-green-500 dark:bg-green-600' :
                        'bg-green-600 dark:bg-green-500'
                      }`}
                    />
                  ))}
                </div>
                <span>More active</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
