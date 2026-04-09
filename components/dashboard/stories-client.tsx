'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Plus, Trophy } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { FrameworkPicker } from '@/components/vbrick/stories/framework-picker'
import { DraftingWizard } from '@/components/vbrick/stories/drafting-wizard'
import { DraftReview } from '@/components/vbrick/stories/draft-review'
import { PracticeRecorder } from '@/components/vbrick/stories/practice-recorder'
import { ScoreCard } from '@/components/vbrick/stories/score-card'
import { VaultCard } from '@/components/vbrick/stories/vault-card'
import { GamificationHeader } from '@/components/vbrick/stories/gamification-header'
import { XPToast } from '@/components/vbrick/stories/xp-toast'
import { getFramework } from '@/lib/vbrick/story-frameworks'
import type { StoryType, StoryDraft, VaultEntry, StoryScore } from '@/lib/vbrick/story-types'
import { STORY_TYPE_LABELS } from '@/lib/vbrick/story-types'

const t = neuTheme

type StoryView = 'home' | 'drafting' | 'review' | 'practice' | 'score'
type TabId = 'create' | 'vault'

export default function StoriesClient({ userEmail }: { userEmail: string }) {
  const email = userEmail
  const [activeTab, setActiveTab] = useState<TabId>('create')
  const [view, setView] = useState<StoryView>('home')

  const [drafts, setDrafts] = useState<StoryDraft[]>([])
  const [activeDraft, setActiveDraft] = useState<StoryDraft | null>(null)
  const [activeFrameworkType, setActiveFrameworkType] = useState<StoryType | null>(null)
  const [personalVault, setPersonalVault] = useState<VaultEntry[]>([])
  const [lastScore, setLastScore] = useState<{ score: StoryScore; isNewBest: boolean; xpEarned: number; vaultEntryId?: string } | null>(null)
  const [xpToast, setXPToast] = useState<{ xp: number; visible: boolean }>({ xp: 0, visible: false })

  const fetchDrafts = useCallback(async () => {
    const res = await fetch(`/api/vbrick/stories/drafts?email=${encodeURIComponent(email)}`)
    if (res.ok) {
      const data = await res.json()
      setDrafts(data.drafts || [])
    }
  }, [email])

  const fetchVault = useCallback(async () => {
    const res = await fetch(`/api/vbrick/stories/vault?email=${encodeURIComponent(email)}`)
    if (res.ok) {
      const data = await res.json()
      setPersonalVault(data.vault || [])
    }
  }, [email])

  useEffect(() => {
    fetchDrafts()
    fetchVault()
  }, [fetchDrafts, fetchVault])

  const handleFrameworkSelect = async (type: StoryType) => {
    setActiveFrameworkType(type)
    const res = await fetch('/api/vbrick/stories/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, storyType: type, title: `${STORY_TYPE_LABELS[type]} Draft` }),
    })
    if (res.ok) {
      const data = await res.json()
      setActiveDraft(data.draft)
      setView('drafting')
    }
  }

  const handlePractice = (draft: StoryDraft) => {
    setActiveDraft(draft)
    setView('practice')
  }

  const handleScoreReceived = (score: StoryScore, isNewBest: boolean, xpEarned: number, vaultEntryId?: string) => {
    setLastScore({ score, isNewBest, xpEarned, vaultEntryId })
    setView('score')
    if (xpEarned > 0) {
      setXPToast({ xp: xpEarned, visible: true })
      setTimeout(() => setXPToast(prev => ({ ...prev, visible: false })), 3000)
    }
  }

  const handleBack = () => {
    setView('home')
    setActiveDraft(null)
    setActiveFrameworkType(null)
    setLastScore(null)
    fetchDrafts()
    fetchVault()
  }

  const handleDeleteVault = async (id: string) => {
    await fetch(`/api/vbrick/stories/vault/${id}`, { method: 'DELETE' })
    fetchVault()
  }

  const handlePracticeVault = async (entry: VaultEntry) => {
    const res = await fetch('/api/vbrick/stories/drafts/adopt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vault_entry_id: entry.id, email }),
    })
    if (res.ok) {
      const data = await res.json()
      setActiveDraft(data.draft)
      setView('practice')
    }
  }

  // Sub-views
  if (view !== 'home') {
    return (
      <div className="px-4 pt-safe pb-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 font-inter text-sm font-medium min-h-[44px] mb-4"
          style={{ color: t.colors.text.muted }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <AnimatePresence mode="wait">
          {view === 'drafting' && activeDraft && activeFrameworkType && (
            <motion.div key="drafting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DraftingWizard
                draftId={activeDraft.id}
                framework={getFramework(activeFrameworkType)!}
                onComplete={(draftContent: string) => {
                  setActiveDraft({ ...activeDraft, draft_content: draftContent, status: 'practicing' as const })
                  setView('review')
                }}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {view === 'review' && activeDraft && (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DraftReview
                content={activeDraft.draft_content || ''}
                storyType={activeDraft.story_type}
                onStartPractice={() => handlePractice(activeDraft)}
                onEdit={(content: string) => setActiveDraft({ ...activeDraft, draft_content: content })}
              />
            </motion.div>
          )}

          {view === 'practice' && activeDraft && (
            <motion.div key="practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PracticeRecorder
                email={email}
                draftId={activeDraft.id}
                draftContent={activeDraft.draft_content || ''}
                onComplete={(result) => handleScoreReceived(result.score, result.isNewBest, result.xpEarned, result.vaultEntryId)}
              />
            </motion.div>
          )}

          {view === 'score' && lastScore && activeDraft && (
            <motion.div key="score" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScoreCard
                score={lastScore.score}
                isNewBest={lastScore.isNewBest}
                xpEarned={lastScore.xpEarned}
                onRetry={() => setView('practice')}
                onSaveToVault={handleBack}
                vaultEntryId={lastScore.vaultEntryId}
                email={email}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <XPToast xp={xpToast.xp} visible={xpToast.visible} onDone={() => setXPToast(prev => ({ ...prev, visible: false }))} />
      </div>
    )
  }

  // Home view with tabs
  const tabs = [
    { id: 'create' as TabId, label: 'Create', icon: Plus },
    { id: 'vault' as TabId, label: 'Vault', icon: Trophy },
  ]

  return (
    <div className="px-4 pt-safe pb-4">
      {/* Header */}
      <div className="h-16 flex items-center">
        <h1 className="font-inter font-bold text-lg" style={{ color: t.colors.text.heading }}>
          Story Vault
        </h1>
      </div>

      {/* Gamification */}
      <GamificationHeader email={email} />

      {/* Tabs */}
      <div className="flex gap-2 mt-4 mb-5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-inter text-sm font-bold uppercase tracking-wider transition-all duration-200 min-h-[44px]"
              style={{
                background: t.colors.bg,
                boxShadow: isActive ? t.shadows.insetSm : t.shadows.raisedSm,
                color: isActive ? t.colors.accent.primary : t.colors.text.muted,
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'create' && (
          <motion.div key="create" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Framework picker */}
            <FrameworkPicker onSelect={handleFrameworkSelect} />

            {/* My Drafts */}
            {drafts.length > 0 && (
              <div className="mt-6">
                <h3
                  className="font-inter font-bold text-[11px] uppercase tracking-[0.15em] mb-3"
                  style={{ color: t.colors.text.muted }}
                >
                  My Drafts
                </h3>
                <div className="space-y-2">
                  {drafts.map((draft) => (
                    <button
                      key={draft.id}
                      onClick={() => {
                        setActiveDraft(draft)
                        setActiveFrameworkType(draft.story_type)
                        if (draft.status === 'draft') {
                          setView('drafting')
                        } else {
                          setView('review')
                        }
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 min-h-[44px]"
                      style={{ background: t.colors.bg, boxShadow: t.shadows.raisedSm }}
                    >
                      <p className="font-inter font-semibold text-sm" style={{ color: t.colors.text.heading }}>
                        {draft.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-inter text-xs" style={{ color: t.colors.text.subtle }}>
                          {STORY_TYPE_LABELS[draft.story_type]}
                        </span>
                        <span
                          className="font-inter text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
                          style={{
                            color: draft.status === 'completed' ? t.colors.score.green : t.colors.accent.primary,
                            background: draft.status === 'completed' ? `${t.colors.score.green}15` : `${t.colors.accent.primary}15`,
                          }}
                        >
                          {draft.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'vault' && (
          <motion.div key="vault" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {personalVault.length === 0 ? (
              <div
                className="rounded-2xl p-8 text-center mt-2"
                style={{ background: t.colors.bg, boxShadow: t.shadows.raised }}
              >
                <Trophy className="w-8 h-8 mx-auto mb-3" style={{ color: t.colors.text.subtle }} />
                <p className="font-inter text-sm" style={{ color: t.colors.text.muted }}>
                  No stories vaulted yet
                </p>
                <p className="font-inter text-xs mt-1" style={{ color: t.colors.text.subtle }}>
                  Record a personal best to save it here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {personalVault.map((entry) => (
                  <VaultCard
                    key={entry.id}
                    entry={entry}
                    onPractice={() => handlePracticeVault(entry)}
                    onDelete={() => handleDeleteVault(entry.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <XPToast xp={xpToast.xp} visible={xpToast.visible} onDone={() => setXPToast(prev => ({ ...prev, visible: false }))} />
    </div>
  )
}
