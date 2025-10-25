import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, X, Coffee, Target, CheckCircle2, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface FocusModeProps {
  tasks?: Array<{ id: string; title: string; completed: boolean }>
  onClose: () => void
  onTaskComplete?: (taskId: string) => void
}

type PomodoroPhase = 'focus' | 'short-break' | 'long-break'

const POMODORO_DURATIONS = {
  focus: 25 * 60, // 25 minutes
  'short-break': 5 * 60, // 5 minutes
  'long-break': 15 * 60 // 15 minutes
}

export function FocusMode({ tasks = [], onClose, onTaskComplete }: FocusModeProps) {
  const [phase, setPhase] = useState<PomodoroPhase>('focus')
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATIONS.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    tasks.find(t => !t.completed)?.id || null
  )

  const totalDuration = POMODORO_DURATIONS[phase]
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100

  // Timer logic
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handlePhaseComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, phase])

  const handlePhaseComplete = useCallback(() => {
    setIsRunning(false)
    
    // Play notification sound (browser notification)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Complete!', {
        body: phase === 'focus' 
          ? 'Time for a break!' 
          : 'Ready to focus again?',
        icon: '/favicon.ico'
      })
    }

    // Transition to next phase
    if (phase === 'focus') {
      setCompletedPomodoros(prev => prev + 1)
      const nextPhase = (completedPomodoros + 1) % 4 === 0 ? 'long-break' : 'short-break'
      setPhase(nextPhase)
      setTimeLeft(POMODORO_DURATIONS[nextPhase])
    } else {
      setPhase('focus')
      setTimeLeft(POMODORO_DURATIONS.focus)
    }
  }, [phase, completedPomodoros])

  const toggleTimer = () => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(POMODORO_DURATIONS[phase])
  }

  const skipPhase = () => {
    setIsRunning(false)
    handlePhaseComplete()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getPhaseInfo = () => {
    switch (phase) {
      case 'focus':
        return {
          title: 'Focus Time',
          icon: Target,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10'
        }
      case 'short-break':
        return {
          title: 'Short Break',
          icon: Coffee,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10'
        }
      case 'long-break':
        return {
          title: 'Long Break',
          icon: Coffee,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10'
        }
    }
  }

  const phaseInfo = getPhaseInfo()
  const PhaseIcon = phaseInfo.icon

  const activeTasks = tasks.filter(t => !t.completed)
  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Close button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10"
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="relative z-10 w-full max-w-2xl space-y-8">
        {/* Phase indicator */}
        <motion.div
          key={phase}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${phaseInfo.bgColor} ${phaseInfo.color} mb-4`}>
            <PhaseIcon className="h-5 w-5" />
            <span className="font-medium">{phaseInfo.title}</span>
          </div>
          
          {/* Pomodoro count */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i < completedPomodoros % 4 ? 'bg-red-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Timer display */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-12">
            <div className="text-center space-y-8">
              {/* Time */}
              <motion.div
                key={timeLeft}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="text-8xl font-bold text-white font-mono tracking-tight"
              >
                {formatTime(timeLeft)}
              </motion.div>

              {/* Progress bar */}
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="text-sm text-white/60">
                  {Math.round(progress)}% complete
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={resetTimer}
                  variant="ghost"
                  size="lg"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                  onClick={toggleTimer}
                  size="lg"
                  className="h-16 w-16 rounded-full bg-white text-gray-900 hover:bg-white/90"
                >
                  {isRunning ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>

                <Button
                  onClick={skipPhase}
                  variant="ghost"
                  size="lg"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Timer className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current task */}
        {selectedTask && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Target className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-sm text-white/60">Current Task</div>
                    <div className="text-lg font-medium text-white">{selectedTask.title}</div>
                  </div>
                </div>
                {onTaskComplete && (
                  <Button
                    onClick={() => {
                      onTaskComplete(selectedTask.id)
                      const nextTask = activeTasks.find(t => t.id !== selectedTask.id)
                      setSelectedTaskId(nextTask?.id || null)
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task list */}
        {activeTasks.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="text-sm text-white/60 mb-4">Today's Tasks ({activeTasks.length})</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeTasks.map(task => (
                  <motion.button
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedTaskId === task.id
                        ? 'bg-blue-500/20 text-white border border-blue-500/30'
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {task.title}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{completedPomodoros}</div>
              <div className="text-xs text-white/60">Pomodoros Today</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{activeTasks.length}</div>
              <div className="text-xs text-white/60">Tasks Remaining</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {Math.round(completedPomodoros * 25 / 60)}h
              </div>
              <div className="text-xs text-white/60">Focus Time</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
