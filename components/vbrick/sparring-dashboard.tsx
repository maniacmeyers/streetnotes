/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useEffect } from 'react'
import { Phone, Trophy, Flame, Users, TrendingUp, Target, Star, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SparringSession } from './sparring-session'
import { cn } from '@/lib/utils'

interface SessionHistory {
  id: string
  persona_id: string
  total_score: number
  would_meet: boolean
  created_at: string
  summary?: string
}

interface SparringStats {
  totalSessions: number
  averageScore: number
  bestScore: number
  uniquePersonas: number
  currentStreak: number
  meetingsBooked: number
}

export function SparringDashboard() {
  const [isPracticing, setIsPracticing] = useState(false)
  const [stats, setStats] = useState<SparringStats | null>(null)
  const [history, setHistory] = useState<SessionHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/vbrick/spar')
      if (!response.ok) throw new Error('Failed to fetch data')
      const data = await response.json()
      setStats(data.stats)
      setHistory(data.sessions)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionComplete = () => {
    fetchDashboardData()
  }

  if (isPracticing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <SparringSession
          onComplete={handleSessionComplete}
          onCancel={() => setIsPracticing(false)}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 80) return 'text-blue-500'
    if (score >= 70) return 'text-yellow-500'
    if (score >= 60) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/10'
    if (score >= 80) return 'bg-blue-500/10'
    if (score >= 70) return 'bg-yellow-500/10'
    if (score >= 60) return 'bg-orange-500/10'
    return 'bg-red-500/10'
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cold Call Sparring Partner</h1>
          <p className="text-muted-foreground">
            Practice against AI prospects. Get scored. Get better.
          </p>
        </div>
        <Button size="lg" onClick={() => setIsPracticing(true)}>
          <Phone className="w-4 h-4 mr-2" />
          Start Practice Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Practice Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalSessions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className={cn('text-3xl font-bold', getScoreColor(stats?.averageScore || 0))}>
              {stats?.averageScore || 0}
            </div>
            <span className="text-sm text-muted-foreground">/100</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Best Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn('text-3xl font-bold', getScoreColor(stats?.bestScore || 0))}>
              {stats?.bestScore || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Flame className="w-4 h-4 inline mr-1" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.currentStreak || 0}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Personas Encountered</span>
                <span className="font-medium">{stats?.uniquePersonas || 0} / 8</span>
              </div>
              <Progress value={((stats?.uniquePersonas || 0) / 8) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Meetings Booked</span>
                <span className="font-medium">{stats?.meetingsBooked || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress
                  value={((stats?.meetingsBooked || 0) / Math.max(stats?.totalSessions || 1, 1)) * 100}
                  className="h-2"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {stats?.totalSessions
                    ? Math.round(((stats.meetingsBooked || 0) / stats.totalSessions) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: History & Leaderboard */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Session History
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No practice sessions yet.</p>
                  <Button variant="link" onClick={() => setIsPracticing(true)}>
                    Start your first session
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg',
                        getScoreBg(session.total_score)
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                          getScoreColor(session.total_score)
                        )}>
                          {session.total_score}
                        </div>
                        <div>
                          <p className="font-medium">vs. {session.persona_id.split('-').join(' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {session.would_meet && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                          Meeting Booked ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mock leaderboard data - in production fetch from API */}
              <div className="space-y-3">
                {[
                  { name: 'Alex M.', score: 94, sessions: 23, trend: 'up' },
                  { name: 'Sarah K.', score: 91, sessions: 31, trend: 'stable' },
                  { name: 'You', score: stats?.averageScore || 0, sessions: stats?.totalSessions || 0, trend: 'up', isYou: true },
                  { name: 'Mike R.', score: 78, sessions: 18, trend: 'down' },
                  { name: 'Jessica T.', score: 76, sessions: 14, trend: 'up' },
                ].map((user, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg',
                      user.isYou && 'bg-primary/10'
                    )}
                  >
                    <div className="w-8 text-center font-bold text-muted-foreground">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium flex items-center gap-2">
                        {user.name}
                        {user.isYou && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.sessions} sessions
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('font-bold', getScoreColor(user.score))}>
                        {user.score}
                      </span>
                      <TrendingUp className={cn(
                        'w-4 h-4',
                        user.trend === 'up' ? 'text-green-500' :
                        user.trend === 'down' ? 'text-red-500' :
                        'text-gray-400'
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'first-call', name: 'First Round', desc: 'Complete first session', icon: '🥊', earned: stats?.totalSessions && stats.totalSessions > 0 },
              { id: 'streak-7', name: 'Training Montage', desc: '7 day streak', icon: '🔥', earned: stats?.currentStreak && stats.currentStreak >= 7 },
              { id: 'streak-30', name: 'Iron BDR', desc: '30 day streak', icon: '⚡', earned: stats?.currentStreak && stats.currentStreak >= 30 },
              { id: 'all-personas', name: 'Master of Disguises', desc: 'All 8 personas', icon: '🎭', earned: stats?.uniquePersonas && stats.uniquePersonas >= 8 },
              { id: 'score-90', name: 'Perfect Game', desc: 'Score 90+', icon: '🎯', earned: stats?.bestScore && stats.bestScore >= 90 },
              { id: 'meeting-booked', name: 'Closer', desc: 'Book a meeting', icon: '🤝', earned: stats?.meetingsBooked && stats.meetingsBooked > 0 },
            ].map((badge) => (
              <Card
                key={badge.id}
                className={cn(
                  'p-4 text-center',
                  !badge.earned && 'opacity-50 grayscale'
                )}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-semibold text-sm">{badge.name}</h3>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
                {badge.earned && (
                  <span className="inline-block mt-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    Earned
                  </span>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Tips Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Permission-based opener:</strong> "Did I catch you at a bad time?" reduces resistance</li>
            <li>• <strong>Mirror objections:</strong> When they say "no budget," ask "What specifically about the budget concerns you?"</li>
            <li>• <strong>Specificity sells:</strong> "Reduced video costs by 40%" trumps "saved money on video"</li>
            <li>• <strong>Control the close:</strong> Never end with "I'll send an email" — get a specific next step</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
