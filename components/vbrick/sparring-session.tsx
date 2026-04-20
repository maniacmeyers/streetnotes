'use client'

import { useState, useRef, useCallback } from 'react'
import { Phone, Mic, Square, Play, Pause, RotateCcw, Trophy, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ALL_PERSONAS, type ProspectPersona, type PersonaId } from '@/lib/vbrick/sparring-personas'
import { getFeedbackLevel, type CallScore } from '@/lib/vbrick/sparring-scoring'
import { cn } from '@/lib/utils'

interface SparringSessionProps {
  onComplete: (score: CallScore, persona: ProspectPersona) => void
  onCancel: () => void
}

type CallState = 'selecting' | 'connecting' | 'in-call' | 'reviewing'

export function SparringSession({ onComplete, onCancel }: SparringSessionProps) {
  const [callState, setCallState] = useState<CallState>('selecting')
  const [selectedPersona, setSelectedPersona] = useState<ProspectPersona | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentScore, setCurrentScore] = useState<CallScore | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<Array<{ speaker: 'bdr' | 'prospect'; text: string }>>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Start a new session with selected persona
  const startSession = async (persona: ProspectPersona) => {
    setIsLoading(true)
    setSelectedPersona(persona)

    try {
      const response = await fetch('/api/vbrick/spar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: persona.id,
          action: 'start'
        })
      })

      if (!response.ok) throw new Error('Failed to start session')

      const data = await response.json()
      setSessionId(data.sessionId)
      setCallState('connecting')

      // Play the AI's opening line
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`)
        audioRef.current = audio
        audio.onended = () => setCallState('in-call')
        audio.play()

        // Add AI opening to conversation
        setConversation([{ speaker: 'prospect', text: data.openingResponse }])
      }
    } catch (error) {
      console.error('Failed to start session:', error)
      alert('Failed to start practice session. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Start recording BDR's response
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Please allow microphone access to practice.')
    }
  }

  // Stop recording and send to AI
  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !selectedPersona) return

    setIsLoading(true)
    mediaRecorderRef.current.stop()
    setIsRecording(false)

    // Stop all tracks to release microphone
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())

    // Wait for the recording to finish
    mediaRecorderRef.current.onstop = async () => {
      try {
        // For MVP: Get transcription (in production, send audio to Whisper)
        // Here we'll simulate with text input for faster iteration
        const simulatedTranscription = prompt('Enter what you said (or paste transcription):')
        if (!simulatedTranscription) {
          setIsLoading(false)
          return
        }

        // Add BDR message to conversation
        const updatedConversation = [
          ...conversation,
          { speaker: 'bdr' as const, text: simulatedTranscription }
        ]
        setConversation(updatedConversation)

        // Get AI response
        const response = await fetch('/api/vbrick/spar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personaId: selectedPersona.id,
            action: 'respond',
            sessionId,
            bdrMessage: simulatedTranscription,
            conversationHistory: updatedConversation.slice(-6) // Last 6 exchanges for context
          })
        })

        if (!response.ok) throw new Error('Failed to get response')

        const data = await response.json()

        // Add AI response to conversation
        setConversation([
          ...updatedConversation,
          { speaker: 'prospect', text: data.response }
        ])

        // Play AI response
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`)
          audioRef.current = audio
          audio.play()
        }
      } catch (error) {
        console.error('Failed to process recording:', error)
        alert('Failed to get response. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  // End the call and get scored
  const endCall = async () => {
    if (!selectedPersona || !sessionId) return

    setIsLoading(true)

    try {
      // Build full transcript from conversation
      const fullTranscript = conversation
        .map(ex => `${ex.speaker === 'bdr' ? 'BDR' : selectedPersona.name}: ${ex.text}`)
        .join('\n\n')

      const response = await fetch('/api/vbrick/spar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: selectedPersona.id,
          action: 'score',
          sessionId,
          transcription: fullTranscript,
          durationSeconds: conversation.length * 30 // Approximate
        })
      })

      if (!response.ok) throw new Error('Failed to score call')

      const data = await response.json()
      setCurrentScore(data.score)
      setCallState('reviewing')
      onComplete(data.score, selectedPersona)
    } catch (error) {
      console.error('Failed to score call:', error)
      alert('Failed to score your call. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Render persona selection screen
  if (callState === 'selecting') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Choose Your Sparring Partner</h2>
          <p className="text-muted-foreground">
            Practice against realistic prospect personas. Each has unique pain points and objections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_PERSONAS.map((persona) => (
            <Card
              key={persona.id}
              className={cn(
                'p-4 cursor-pointer transition-all hover:shadow-lg',
                selectedPersona?.id === persona.id && 'ring-2 ring-primary'
              )}
              onClick={() => startSession(persona)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {persona.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{persona.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{persona.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {persona.company} • {persona.companySize}
                  </p>
                </div>
              </div>
              <p className="text-sm mt-3 line-clamp-2">{persona.personality}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {persona.painPoints.slice(0, 2).map((pain, i) => (
                  <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-full">
                    {pain.split(' ').slice(0, 3).join(' ')}...
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="mt-2 text-muted-foreground">Initiating call...</p>
          </div>
        )}
      </div>
    )
  }

  // Render connecting screen
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

  // Render active call interface
  if (callState === 'in-call') {
    return (
      <div className="space-y-6">
        {/* Call Header */}
        <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {selectedPersona?.name[0]}
            </div>
            <div>
              <h3 className="font-semibold">{selectedPersona?.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedPersona?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">On Call</span>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>

        {/* Conversation */}
        <div className="bg-muted/50 rounded-lg p-4 h-64 overflow-y-auto space-y-3">
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
                  : 'bg-muted'
              )}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <Button
              size="lg"
              onClick={startRecording}
              disabled={isLoading}
              className="rounded-full w-16 h-16"
            >
              <Mic className="w-6 h-6" />
            </Button>
          ) : (
            <Button
              size="lg"
              variant="destructive"
              onClick={stopRecording}
              className="rounded-full w-16 h-16 animate-pulse"
            >
              <Square className="w-6 h-6" />
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={endCall}
            disabled={isLoading || conversation.length < 2}
          >
            <Phone className="w-4 h-4 mr-2 rotate-[135deg]" />
            End & Score
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {isRecording ? 'Recording... Click stop when done' : 'Click mic to respond'}
        </p>
      </div>
    )
  }

  // Render score review
  if (callState === 'reviewing' && currentScore) {
    const feedbackLevel = getFeedbackLevel(currentScore.totalScore)
    const levelColors = {
      exceptional: 'text-green-500',
      strong: 'text-blue-500',
      good: 'text-yellow-500',
      fair: 'text-orange-500',
      poor: 'text-red-500'
    }

    return (
      <div className="space-y-6">
        {/* Score Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted">
            <span className={cn('text-4xl font-bold', levelColors[feedbackLevel])}>
              {currentScore.totalScore}
            </span>
          </div>
          <h2 className="text-2xl font-bold capitalize">{feedbackLevel} Performance</h2>
          <p className="text-muted-foreground">vs. {selectedPersona?.name}, {selectedPersona?.title}</p>
        </div>

        {/* Dimension Scores */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Score Breakdown
          </h3>
          <div className="space-y-3">
            {currentScore.dimensions.map((dim) => (
              <div key={dim.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{dim.name}</span>
                  <span className="font-medium">{dim.score}%</span>
                </div>
                <Progress value={dim.score} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-green-600">What You Did Well</h3>
            <ul className="space-y-2">
              {currentScore.strengths.map((strength, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-green-500">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-blue-600">Focus Areas</h3>
            <ul className="space-y-2">
              {currentScore.improvements.map((improvement, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  {improvement}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Sample Exchanges */}
        {currentScore.sampleExchanges.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Key Moments</h3>
            <div className="space-y-4">
              {currentScore.sampleExchanges.slice(0, 4).map((exchange, i) => (
                <div key={i} className="text-sm">
                  <p className={cn(
                    'font-medium',
                    exchange.speaker === 'bdr' ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {exchange.speaker === 'bdr' ? 'You' : selectedPersona?.name}:
                  </p>
                  <p className="text-muted-foreground mt-1">"{exchange.text}"</p>
                  {exchange.feedback && (
                    <p className="text-xs text-blue-600 mt-1 italic">{exchange.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button onClick={() => setCallState('selecting')}>
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
