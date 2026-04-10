'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Plus, Trophy, Trash2, BookOpen } from 'lucide-react'
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
import { GlassTabs } from '@/components/ui/glass-tabs'
import { SwipeToDelete } from '@/components/vbrick/swipe-to-delete'
import { getFramework } from '@/lib/vbrick/story-frameworks'
import type { StoryType, StoryDraft, VaultEntry, StoryScore } from '@/lib/vbrick/story-types'
import { STORY_TYPE_LABELS } from '@/lib/vbrick/story-types'

type StoryView = 'home' | 'drafting' | 'review' | 'practice' | 'score'
type TabId = 'create' | 'vault' | 'team'

export default function StoriesClient({ userEmail }: { userEmail: string }) {
  const email = userEmail
  const [activeTab, setActiveTab] = useState<TabId>('create')
  const [view, setView] = useState<StoryView>('home')

  const [drafts, setDrafts] = useState<StoryDraft[]>([])
  const [activeDraft, setActiveDraft] = useState<StoryDraft | null>(null)
  const [activeFrameworkType, setActiveFrameworkType] = useState<StoryType | null>(null)
  const [personalVault, setPersonalVault] = useState<VaultEntry[]>([])
  const [teamVault, setTeamVault] = useState<VaultEntry[]>([])
  const [adoptingId, setAdoptingId] = useState<string | null>(null)
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

  const fetchTeamVault = useCallback(async () => {
    const res = await fetch('/api/vbrick/stories/vault/team')
    if (res.ok) {
      const data = await res.json()
      setTeamVault(data.vault || [])
    }
  }, [])

  useEffect(() => {
    fetchDrafts()
    fetchVault()
    fetchTeamVault()
  }, [fetchDrafts, fetchVault, fetchTeamVault])

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
    fetchTeamVault()
  }

  const handleDeleteVault = async (id: string) => {
    await fetch(`/api/vbrick/stories/vault/${id}`, { method: 'DELETE' })
    fetchVault()
    fetchTeamVault()
  }

  const handleToggleShare = async (id: string, currentlyShared: boolean) => {
    await fetch(`/api/vbrick/stories/vault/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shared_to_team: !currentlyShared }),
    })
    fetchVault()
    fetchTeamVault()
  }

  const handleDeleteDraft = async (id: string) => {
    await fetch(`/api/vbrick/stories/drafts/${id}`, { method: 'DELETE' })
    fetchDrafts()
  }

  const handlePracticeVault = async (entry: VaultEntry) => {
    setAdoptingId(entry.id)
    try {
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
    } finally {
      setAdoptingId(null)
    }
  }

  // Sub-views
  if (view !== 'home') {
    return (
      <div className="px-4 pt-6 pb-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest font-bold text-white/50 hover:text-volt min-h-[44px] mb-4 cursor-pointer transition-colors"
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
    { id: 'vault', label: 'My Vault', icon: <Trophy className="w-4 h-4" /> },
    { id: 'team', label: 'Team', icon: <BookOpen className="w-4 h-4" /> },
  ]

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80">
          Practice & Perform
        </p>
        <h1 className="font-bold text-3xl text-white leading-tight mt-1">
          Story <span className="text-volt drop-shadow-[0_0_16px_rgba(0,230,118,0.4)]">Vault</span>
        </h1>
      </div>

      {/* Gamification */}
      <div className="mt-5">
        <GamificationHeader email={email} />
      </div>

      {/* Tabs */}
      <div className="mt-5 mb-5">
        <GlassTabs items={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'create' && (
          <motion.div key="create" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Framework picker */}
            <FrameworkPicker onSelect={handleFrameworkSelect} />

            {/* My Drafts */}
            {drafts.length > 0 && (
              <div className="mt-6">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-volt/80 mb-3">
                  My Drafts
                </h3>
                <div className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {drafts.map((draft) => {
                      const statusBadge =
                        draft.status === 'completed'
                          ? 'text-volt border-volt/40 bg-volt/10'
                          : 'text-white/60 border-white/15 bg-white/5'
                      return (
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
                            <div className="glass rounded-xl flex items-center gap-2 hover:border-volt/30 transition-all">
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
                                className="flex-1 text-left px-4 py-3 min-h-[56px] bg-transparent border-none cursor-pointer rounded-xl"
                              >
                                <p className="font-bold text-sm text-white leading-tight">
                                  {draft.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/50 font-bold">
                                    {STORY_TYPE_LABELS[draft.story_type]}
                                  </span>
                                  <span
                                    className={`font-mono text-[9px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 rounded border ${statusBadge}`}
                                  >
                                    {draft.status}
                                  </span>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteDraft(draft.id)
                                }}
                                aria-label="Delete draft"
                                className="flex items-center justify-center w-11 h-11 mr-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 cursor-pointer transition-colors duration-150"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </SwipeToDelete>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'vault' && (
          <motion.div key="vault" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {personalVault.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center mt-2">
                <Trophy
                  className="w-10 h-10 mx-auto mb-3 text-volt"
                  style={{ filter: 'drop-shadow(0 0 12px rgba(0, 230, 118, 0.5))' }}
                />
                <p className="font-bold text-xl text-white">No stories vaulted yet</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/50 mt-2">
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
                          showShare
                          onToggleShare={() => handleToggleShare(entry.id, entry.shared_to_team)}
                          onPractice={() => handlePracticeVault(entry)}
                          onDelete={() => handleDeleteVault(entry.id)}
                          email={email}
                        />
                      </SwipeToDelete>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'team' && (
          <motion.div key="team" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {teamVault.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center mt-2">
                <BookOpen
                  className="w-10 h-10 mx-auto mb-3 text-volt"
                  style={{ filter: 'drop-shadow(0 0 12px rgba(0, 230, 118, 0.5))' }}
                />
                <p className="font-bold text-xl text-white">No team stories yet</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/50 mt-2">
                  Share one of your best from My Vault to start the library
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {teamVault.map((entry) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <VaultCard
                        entry={entry}
                        showAuthor
                        onAdopt={() => handlePracticeVault(entry)}
                        adopting={adoptingId === entry.id}
                        onDelete={entry.bdr_email === email ? () => handleDeleteVault(entry.id) : undefined}
                        email={email}
                      />
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
