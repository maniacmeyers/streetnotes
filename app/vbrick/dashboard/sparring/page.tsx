/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState } from 'react'
import { PhoneOff, Dumbbell, HelpCircle, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FrameworkSparringSession } from '@/components/vbrick/framework-sparring-session'
import { BDR_CALL_FRAMEWORK } from '@/lib/vbrick/bdr-framework'
import { type ProspectPersona } from '@/lib/vbrick/sparring-personas'

type SessionResult = {
  score: number
  frameworkScore: number
  wouldTransfer: boolean
  [key: string]: unknown
}

export default function FrameworkSparringPage() {
  const [isActiveSession, setIsActiveSession] = useState(false)
  const [lastResult, setLastResult] = useState<SessionResult | null>(null)
  const [lastPersona, setLastPersona] = useState<ProspectPersona | null>(null)

  const handleSessionComplete = (result: SessionResult, persona: ProspectPersona) => {
    setLastResult(result)
    setLastPersona(persona)
    setIsActiveSession(false)
  }

  if (isActiveSession) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <h1 className="font-bold text-lg">Cold Call Sparring — Active Session</h1>
          </div>
        </header>
        <main className="p-6">
          <FrameworkSparringSession
            onComplete={handleSessionComplete}
            onCancel={() => setIsActiveSession(false)}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Cold Call Gym</h1>
              <p className="text-xs text-muted-foreground">Framework Practice for VBRICK BDRs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>The VBRICK Cold Call Framework</DialogTitle>
                  <DialogDescription>
                    Practice the exact framework used on live calls
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">1. Name Capture</h4>
                    <p className="font-mono text-sm mb-2">
                      "Hi, this is [BDR Name] from VBRICK. Could I get your first and last name?"
                    </p>
                    <p className="text-muted-foreground">
                      Purpose: Build rapport, establish friendly tone
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">2. Qualification Question</h4>
                    <p className="font-mono text-sm mb-2">
                      "Great, I was hoping you could help me out. Are you on the team responsible for [company's] video communications?"
                    </p>
                    <p className="text-muted-foreground">
                      Purpose: Identify decision-maker vs. influencer
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold mb-2 text-green-800">3a. YES Path</h4>
                      <p className="font-mono text-sm text-green-800">
                        "The reason I'm calling is we help companies consolidate their video platforms into one secure, manageable system..."
                      </p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-semibold mb-2 text-orange-800">3b. NO Path</h4>
                      <p className="font-mono text-sm text-orange-800">
                        "Oh, sorry about that. Who do you feel the best person to speak with about video communications is?"
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">4. The Bridge</h4>
                    <p className="font-mono text-sm mb-2">
                      "Thanks so much! May I tell her hi for you?"
                    </p>
                    <p className="text-muted-foreground">
                      Purpose: Get permission to name-drop, leave positive impression
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-800">💡 Accent Tips for Irish & NZ BDRs</h4>
                    <ul className="space-y-2 text-blue-800">
                      <li>• <strong>Irish:</strong> Slow down at "VBRICK," enunciate final consonants</li>
                      <li>• <strong>New Zealand:</strong> Make "video" clear (not "vedeo"), flatten statement intonation</li>
                      <li>• Both: Use pauses to compensate for accent speed</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={() => setIsActiveSession(true)}>
              <Dumbbell className="w-4 h-4 mr-2" />
              Start Practice
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        {!lastResult && (
          <div className="mb-8 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Master the Framework</h2>
                <p className="text-white/80 mb-4">
                  Practice the VBRICK cold call framework against AI prospects. 
                  Get real-time feedback on your delivery, handling objections, 
                  and accent clarity.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsActiveSession(true)}
                  >
                    <PhoneOff className="w-4 h-4 mr-2 rotate-[135deg]" />
                    Start First Session
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-48 h-32 bg-white/10 rounded-lg flex flex-col items-center justify-center text-center p-4">
                  <Volume2 className="w-10 h-10 text-white/50 mb-2" />
                  <p className="text-sm text-white/70">Voice-enabled practice with AI personas</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Session Result */}
        {lastResult && (
          <div className="mb-8 bg-muted border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                  lastResult.score >= 90 ? 'bg-green-100 text-green-600' :
                  lastResult.score >= 80 ? 'bg-blue-100 text-blue-600' :
                  lastResult.score >= 70 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {lastResult.score}
                </div>
                <div>
                  <p className="font-medium text-lg">
                    {lastResult.score >= 90 ? 'Outstanding!' : 
                     lastResult.score >= 80 ? 'Great Job!' :
                     lastResult.score >= 70 ? 'Good Work' : 'Keep Practicing'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    vs. {lastPersona?.name} • Framework Score: {lastResult.frameworkScore}%
                  </p>
                  {lastResult.wouldTransfer && (
                    <span className="inline-block mt-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                      ✓ Would Transfer
                    </span>
                  )}
                </div>
              </div>
              <Button onClick={() => setIsActiveSession(true)}>
                Practice Again
              </Button>
            </div>
          </div>
        )}

        {/* Framework Steps Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {BDR_CALL_FRAMEWORK.steps.map((step, i) => (
            <div key={step.id} className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-sm">{step.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{step.objective}</p>
              <p className="text-xs font-mono bg-muted p-2 rounded">
                "{step.script.substring(0, 50)}..."
              </p>
            </div>
          ))}
        </div>

        {/* Available Personas */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Available Personas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'disinterested-it-manager', name: 'Marcus', title: 'IT Manager', difficulty: 'Hard', color: 'bg-orange-500' },
              { id: 'budget-conscious-cfo', name: 'Jennifer', title: 'CFO', difficulty: 'Hard', color: 'bg-red-500' },
              { id: 'overwhelmed-cto', name: 'David', title: 'CTO', difficulty: 'Medium', color: 'bg-yellow-500' },
              { id: 'skeptical-security-officer', name: 'Sarah', title: 'CISO', difficulty: 'Medium', color: 'bg-purple-500' },
              { id: 'enthusiastic-innovator', name: 'Alex', title: 'VP Innovation', difficulty: 'Easy', color: 'bg-green-500' },
              { id: 'busy-exec-assistant', name: 'Patricia', title: 'Exec Assistant', difficulty: 'Easy', color: 'bg-blue-500' },
              { id: 'compliance-heavy-legal', name: 'Robert', title: 'General Counsel', difficulty: 'Medium', color: 'bg-indigo-500' },
              { id: 'price-shopping-procurement', name: 'Linda', title: 'Procurement', difficulty: 'Hard', color: 'bg-pink-500' },
            ].map((persona) => (
              <div key={persona.id} className="bg-card border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                   onClick={() => setIsActiveSession(true)}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full ${persona.color} flex items-center justify-center text-white font-bold`}>
                    {persona.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{persona.name}</h3>
                    <p className="text-xs text-muted-foreground">{persona.title}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  persona.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  persona.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {persona.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Accent-Specific Tips */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-800 mb-3">🇮🇪 Irish Accent Coaching</h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Slow down slightly — Irish accents tend to blur words</li>
              <li>• Enunciate final consonants on "VBRICK"</li>
              <li>• Practice: "responsible" — distinct syllables</li>
              <li>• Use pauses strategically to compensate for speed</li>
              <li>• Emphasize numbers: "thirty percent" not "thirty percen"</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-3">🇳🇿 New Zealand Accent Coaching</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Make "i" sounds clear: "VBRICK" not "VBRUCK"</li>
              <li>• Flatten lift at end of statements (not questions)</li>
              <li>• Practice: "video" — clear V sound</li>
              <li>• Emphasize "responsible" — complex for flat vowels</li>
              <li>• Slow down company name: "V-B-R-I-C-K"</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
