'use client'

import { useState, useRef } from 'react'
import { Phone, Mic, Square, RotateCcw, Trophy, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ALL_PERSONAS, type ProspectPersona } from '@/lib/vbrick/sparring-personas'
import { BDR_CALL_FRAMEWORK } from '@/lib/vbrick/bdr-framework'
import { cn } from '@/lib/utils'

interface FrameworkSparringSessionProps {
  onComplete: (result: any, persona: ProspectPersona) => void
  onCancel: () => void
  bdrName?: string
}

type CallState = 'select' | 'accent' | 'briefing' | 'connecting' | 'in-call' | 'reviewing'
type BDRAccent = 'irish' | 'newZealand' | 'general'

const ACCENT_INFO: Record<BDRAccent, { name: string; description: string; tips: string[] }> = {
  irish: {
    name: 'Irish Accent',
    description: 'Fast, musical intonation, melodic flow',
    tips: [
      'Slow down slightly at key words',
      'Enunciate final consonants (VBRICK, not VBRICKH)',
      'Emphasize numbers and percentages',
      'Use pauses to compensate for natural speed'
    ]
  },
  newZealand: {
    name: 'New Zealand Accent',
    description: 'Flat vowels, "i" sounds like "u"',
    tips: [
      'Practice "VBRICK" - clear I sound, not "VBRUCK"',
      'Make "video" clear - not "vedeo"',
      'Flatten lift at end of statements',
      'Emphasize "responsible" - complex word'
    ]
  },
  general: {
    name: 'General / Other',
    description: 'Standard coaching applies',
    tips: [
      'Focus on framework structure',
      'Enunciate company name clearly',
      'Use natural pauses',
      'Maintain friendly, confident tone'
    ]
  }
}

export function FrameworkSparringSession({ onComplete, onCancel, bdrName }: FrameworkSparringSessionProps) {
  const [callState, setCallState] = useState<CallState>('select')
  const [selectedPersona, setSelectedPersona] = useState<ProspectPersona | null>(null)
  const [selectedAccent, setSelectedAccent] = useState<BDRAccent>('general')
  const [isRecording, setIsRecording] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentScore, setCurrentScore] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<Array<{ speaker: 'bdr' | 'prospect'; text: string }>>([])
  const [currentStep, setCurrentStep] = useState('name_capture')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Start session
  const startSession = async (persona: ProspectPersona) => {
    setIsLoading(true)
    setSelectedPersona(persona)

    try {
      const response = await fetch('/api/vbrick/framework-spar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: persona.id,
          action: 'start',
          bdrAccent: selectedAccent
        })
      })

      if (!response.ok) throw new Error('Failed to start session')

      const data = await response.json()
      setSessionId(data.sessionId)
      setCurrentStep(data.framework.currentStep)
      setCallState('connecting')

      // Play AI opening
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`)
        audioRef.current = audio
        setIsPlayingAudio(true)
        audio.onended = () => {
          setIsPlayingAudio(false)
          setCallState('in-call')
        }
        audio.play()

        setConversation([{ speaker: 'prospect', text: data.openingResponse }])
      }
    } catch (error) {
      console.error('Failed to start session:', error)
      alert('Failed to start practice session. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle BDR response using text input (for MVP - can integrate Whisper later)
  const submitBDRResponse = async (text: string) => {
    if (!selectedPersona || !sessionId) return

    setIsLoading(true)

    try {
      // Add BDR message to conversation
      const updatedConversation = [
        ...conversation,
        { speaker: 'bdr' as const, text }
      ]
      setConversation(updatedConversation)

      // Get AI response
      const response = await fetch('/api/vbrick/framework-spar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: selectedPersona.id,
          action: 'respond',
          sessionId,
          bdrMessage: text,
          currentStep,
          conversationHistory: updatedConversation.slice(-6),
          bdrAccent: selectedAccent
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setCurrentStep(data.nextStep)

      // Add AI response
      setConversation([
        ...updatedConversation,
        { speaker: 'prospect', text: data.response }
      ])

      // Play AI response
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`)
        audioRef.current = audio
        setIsPlayingAudio(true)
        audio.onended = () => setIsPlayingAudio(false)
        audio.play()
      }
    } catch (error) {
      console.error('Failed to process response:', error)
      alert('Failed to get response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // End call and score
  const endCall = async () => {
    if (!selectedPersona || !sessionId) return

    setIsLoading(true)

    try {
      const fullTranscript = conversation
        .map(ex => `${ex.speaker === 'bdr' ? 'BDR' : selectedPersona.name}: ${ex.text}`)
        .join('\n\n')

      const response = await fetch('/api/vbrick/framework-spar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: selectedPersona.id,
          action: 'score',
          sessionId,
          transcription: fullTranscript,
          bdrAccent: selectedAccent,
          durationSeconds: conversation.length * 30
        })
      })

      if (!response.ok) throw new Error('Failed to score call')

      const data = await response.json()
      setCurrentScore(data)
      setCallState('reviewing')
      onComplete(data, selectedPersona)
    } catch (error) {
      console.error('Failed to score call:', error)
      alert('Failed to score your call. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Persona selection screen
  if (callState === 'select') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Choose Your Practice Partner</h2>
          <p className="text-muted-foreground">
            Select a persona that matches who you're calling next
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_PERSONAS.map((persona) => (
            <Card
              key={persona.id}
              className="p-4 cursor-pointer transition-all hover:shadow-lg hover:border-primary"
              onClick={() => setCallState('accent') || setSelectedPersona(persona)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {persona.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{persona.name}</h3>
                  <p className="text-sm text-muted-foreground">{persona.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {persona.company} • {persona.companySize}
                  </p>
                </div>
              </div>
              <p className="text-sm mt-3 text-muted-foreground line-clamp-2">
                {persona.personality}
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {persona.painPoints.slice(0, 2).map((pain, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {pain.split(' ').slice(0, 3).join(' ')}...
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Accent selection
  if (callState === 'accent' && selectedPersona) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Select Your Accent Profile</h2>
          <p className="text-muted-foreground">
            We'll provide personalized coaching tips based on your accent
          </p>
        </div>

        <div className="grid gap-4">
          {(Object.keys(ACCENT_INFO) as BDRAccent[]).map((accent) => (
            <Card
              key={accent}
              className={cn(
                'p-6 cursor-pointer transition-all',
                selectedAccent === accent && 'ring-2 ring-primary border-primary'
              )}
              onClick={() => setSelectedAccent(accent)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{ACCENT_INFO[accent].name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ACCENT_INFO[accent].description}
                  </p>
                </div>
                {selectedAccent === accent && (
                  <Badge>Selected</Badge>
                )}
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Coaching Tips:</p>
                {ACCENT_INFO[accent].tips.map((tip, i) => (
                  <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </p>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => setCallState('select')}>
            Back
          </Button>
          <Button onClick={() => startSession(selectedPersona)} disabled={isLoading}>
            {isLoading ? 'Connecting...' : 'Start Practice Call'}
            <Phone className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  // Connecting screen
  if (callState === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <Phone className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
        </div>
        <p className="text-xl font-medium">Calling {selectedPersona?.name}...</p>
        <p className="text-muted-foreground">{selectedPersona?.title} at {selectedPersona?.company}</p>
      </div>
    )
  }

  // Active call UI
  if (callState === 'in-call' && selectedPersona) {
    const frameworkStep = BDR_CALL_FRAMEWORK.steps.find(s => s.id === currentStep)
    const accentInfo = ACCENT_INFO[selectedAccent]
    const accentTips = frameworkStep?.coachingTips?.[selectedAccent as 'irish' | 'newZealand'] || []

    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Call Header */}
        <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {selectedPersona.name[0]}
            </div>
            <div>
              <h3 className="font-semibold">{selectedPersona.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedPersona.title}</p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {isPlayingAudio ? (
              <><Volume2 className="w-3 h-3 animate-pulse" /> Speaking...</>
            ) : (
              'Your turn'
            )}
          </Badge>
        </div>

        {/* Framework Progress */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Framework Progress</span>
            <span className="text-sm text-muted-foreground">
              Step {BDR_CALL_FRAMEWORK.steps.findIndex(s => s.id === currentStep) + 1} of {BDR_CALL_FRAMEWORK.steps.length}
            </span>
          </div>
          <Progress 
            value={(BDR_CALL_FRAMEWORK.steps.findIndex(s => s.id === currentStep) + 1) / BDR_CALL_FRAMEWORK.steps.length * 100} 
            className="h-2"
          />
        </div>

        {/* Current Step Guidance */}
        {frameworkStep && (
          <Card className="p-4 border-l-4 border-l-primary">
            <h4 className="font-semibold mb-2">Current Step: {frameworkStep.name}</h4>
            <p className="text-sm text-muted-foreground mb-3">{frameworkStep.objective}</p>
            <div className="bg-muted rounded p-3 font-mono text-sm">
              "{frameworkStep.script.replace('{company}', selectedPersona.company).replace('{x}', 'video communications')}"
            </div>
            
            {accentTips.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  💡 {accentInfo.name} Tip:
                </p>
                <p className="text-sm text-yellow-700">
                  {accentTips[0]}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Conversation */}
        <div className="bg-muted/50 rounded-lg p-4 h-48 overflow-y-auto space-y-3">
          {conversation.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-2',
                msg.speaker === 'bdr' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div className={cn(
                'max-w-[80%] rounded-lg p-3',
                msg.speaker === 'bdr'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted border'
              )}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Response Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your response (or speak)..."
            className="flex-1 px-4 py-2 rounded-lg border bg-background"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                submitBDRResponse(e.currentTarget.value)
                e.currentTarget.value = ''
              }
            }}
            disabled={isLoading || isPlayingAudio}
          />
          <Button
            onClick={() => {
              const input = document.querySelector('input') as HTMLInputElement
              if (input.value) {
                submitBDRResponse(input.value)
                input.value = ''
              }
            }}
            disabled={isLoading || isPlayingAudio}
          >
            Send
          </Button>
          <Button
            variant="outline"
            onClick={endCall}
            disabled={isLoading || conversation.length < 2}
          >
            <Square className="w-4 h-4 mr-2" />
            End Call
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          💡 Tip: {isPlayingAudio ? 'Listen to their response...' : 'Type your response following the framework script above'}
        </p>
      </div>
    )
  }

  // Review screen
  if (callState === 'reviewing' && currentScore) {
    const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-green-500'
      if (score >= 80) return 'text-blue-500'
      if (score >= 70) return 'text-yellow-500'
      return 'text-orange-500'
    }

    const getScoreBg = (score: number) => {
      if (score >= 90) return 'bg-green-500/10'
      if (score >= 80) return 'bg-blue-500/10'
      if (score >= 70) return 'bg-yellow-500/10'
      return 'bg-orange-500/10'
    }

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Overall Score */}
        <div className="text-center space-y-2">
          <div className={cn('inline-flex items-center justify-center w-28 h-28 rounded-full', getScoreBg(currentScore.score))}>
            <span className={cn('text-5xl font-bold', getScoreColor(currentScore.score))}>
              {currentScore.score}
            </span>
          </div>
          <h2 className="text-2xl font-bold">
            {currentScore.score >= 90 ? 'Excellent!' : 
             currentScore.score >= 80 ? 'Great Job!' :
             currentScore.score >= 70 ? 'Good Work' : 'Keep Practicing'}
          </h2>
          <p className="text-muted-foreground">
            Call with {selectedPersona?.name} as a {ACCENT_INFO[selectedAccent].name} speaker
          </p>
        </div>

        {/* Framework Score */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Framework Adherence: {currentScore.frameworkScore}%</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(currentScore.frameworkAnalysis || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                {value ? (
                  <Badge variant="default" className="bg-green-500">✓</Badge>
                ) : (
                  <Badge variant="outline">✗</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Dimension Scores */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Score Breakdown</h3>
          <div className="space-y-3">
            {currentScore.dimensions?.map((dim: any) => (
              <div key={dim.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{dim.name}</span>
                  <span className="font-medium">{dim.score}%</span>
                </div>
                <Progress value={dim.score} className="h-2" />
                {dim.feedback && (
                  <p className="text-xs text-muted-foreground mt-1">{dim.feedback}</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Accent Feedback */}
        {currentScore.accentFeedback && (
          <Card className="p-4 border-l-4 border-l-yellow-400">
            <h3 className="font-semibold mb-2">🎯 Accent Coaching</h3>
            <p className="text-sm text-muted-foreground">{currentScore.accentFeedback}</p>
          </Card>
        )}

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-green-600">What You Did Well</h3>
            <ul className="space-y-2">
              {currentScore.strengths?.map((strength: string, i: number) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-blue-600">Focus Areas</h3>
            <ul className="space-y-2">
              {currentScore.improvements?.map((improvement: string, i: number) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-blue-500" />
                  {improvement}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Script Improvements */}
        {currentScore.scriptImprovements?.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Script Refinements</h3>
            <div className="space-y-3">
              {currentScore.scriptImprovements.map((item: any, i: number) => (
                <div key={i} className="p-3 bg-muted rounded">
                  <p className="text-sm text-muted-foreground line-through">"{item.original}"</p>
                  <p className="text-sm font-medium mt-1">"{item.improved}"</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Would Transfer */}
        <div className={cn(
          'p-4 rounded-lg text-center',
          currentScore.wouldTransfer ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
        )}>
          {currentScore.wouldTransfer 
            ? `✓ ${selectedPersona?.name} would've transferred you! (${currentScore.transferConfidence}% confidence)`
            : `✗ ${selectedPersona?.name} probably wouldn't have transferred you (${currentScore.transferConfidence}% confidence)`
          }
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button onClick={() => { setCallState('select'); setCurrentScore(null); setConversation([]); }}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return null
}
