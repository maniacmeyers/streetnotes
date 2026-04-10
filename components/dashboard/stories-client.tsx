'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Plus, Trophy, Trash2 } from 'lucide-react'
import {
  FrameworkPicker,
  DraftingWizard,
  DraftReview,
  PracticeRecorder,
  ScoreCard,
  VaultCard,
  GamificationHeader,
  XPToast,
} from '@/components/streetnotes/stories'
import { BrutalTabs, BrutalBadge } from '@/components/streetnotes/brutal'
import { SwipeToDelete } from '@/components/vbrick/swipe-to-delete'
import { getFramework } from '@/lib/vbrick/story-frameworks'
import type { StoryType, StoryDraft, VaultEntry, StoryScore } from '@/lib/vbrick/story-types'
import { STORY_TYPE_LABELS } from '@/lib/vbrick/story-types'

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

  const handleDeleteDraft = async (id: string) => {
    await fetch(`/api/vbrick/stories/drafts/${id}`, { method: 'DELETE' })
    fetchDrafts()
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
          className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-volt min-h-[44px] mb-4"
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
    { id: 'create', label: 'Create', icon: <Plus className="w-4 h-4" /> },
    { id: 'vault', label: 'Vault', icon: <Trophy className="w-4 h-4" /> },
  ]

  return (
    <div className="px-4 pt-safe pb-4">
      {/* Header */}
      <div className="h-20 flex items-end pb-2">
        <h1
          className="font-display uppercase text-3xl sm:text-4xl text-white leading-[0.85]"
          style={{ textShadow: '3px 3px 0px #000000' }}
        >
          Story <span className="text-volt">Vault</span>
        </h1>
      </div>

      {/* Gamification */}
      <div className="mt-3">
        <GamificationHeader email={email} />
      </div>

      {/* Tabs */}
      <div className="mt-5 mb-5">
        <BrutalTabs items={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'create' && (
          <motion.div key="create" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Framework picker */}
            <FrameworkPicker onSelect={handleFrameworkSelect} />

            {/* My Drafts */}
            {drafts.length > 0 && (
              <div className="mt-6">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] font-bold text-gray-400 mb-3">
                  My Drafts
                </h3>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {drafts.map((draft) => (
                      <motion.div
                        key={draft.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <SwipeToDelete
                          onDelete={() => handleDeleteDraft(draft.id)}
                          variant="brutal"
                        >
                          <div className="flex items-center gap-2 bg-white border-4 border-black shadow-neo-sm">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveDraft(draft)
                                setActiveFrameworkType(draft.story_type)
                                if (draft.status === 'draft') {
                                  setView('drafting')
                                } else {
                                  setView('review')
                                }
                              }}
                              className="flex-1 text-left px-4 py-3 min-h-[56px] bg-transparent border-none"
                            >
                              <p className="font-display uppercase text-base text-black leading-[0.9]">
                                {draft.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-black/60 font-bold">
                                  {STORY_TYPE_LABELS[draft.story_type]}
                                </span>
                                <BrutalBadge
                                  variant={draft.status === 'completed' ? 'black' : 'white'}
                                >
                                  {draft.status}
                                </BrutalBadge>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteDraft(draft.id)
                              }}
                              aria-label="Delete draft"
                              className="flex items-center justify-center w-11 h-11 mr-1 border-2 border-black bg-white text-black hover:bg-red-600 hover:text-white cursor-pointer transition-colors duration-150"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </SwipeToDelete>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'vault' && (
          <motion.div key="vault" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {personalVault.length === 0 ? (
              <div className="bg-white border-4 border-black shadow-neo-sm p-8 text-center mt-2">
                <Trophy className="w-10 h-10 mx-auto mb-3 text-black" />
                <p className="font-display uppercase text-xl text-black">No stories vaulted yet</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-black/60 mt-2">
                  Record a personal best to save it here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {personalVault.map((entry) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <SwipeToDelete
                        onDelete={() => handleDeleteVault(entry.id)}
                        variant="brutal"
                      >
                        <VaultCard
                          entry={entry}
                          onPractice={() => handlePracticeVault(entry)}
                          onDelete={() => handleDeleteVault(entry.id)}
                        />
                      </SwipeToDelete>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <XPToast xp={xpToast.xp} visible={xpToast.visible} onDone={() => setXPToast(prev => ({ ...prev, visible: false }))} />
    </div>
  )
}
