'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, BookOpen, Shield, Rocket } from 'lucide-react'
import { NeuCard, NeuButton, NeuTabs } from '@/components/vbrick/neu'
import { FrameworkPicker } from '@/components/vbrick/stories/framework-picker'
import { DraftingWizard } from '@/components/vbrick/stories/drafting-wizard'
import { DraftReview } from '@/components/vbrick/stories/draft-review'
import { PracticeRecorder } from '@/components/vbrick/stories/practice-recorder'
import { ScoreCard } from '@/components/vbrick/stories/score-card'
import { GamificationHeader } from '@/components/vbrick/stories/gamification-header'
import { VaultCard } from '@/components/vbrick/stories/vault-card'
import { XPToast } from '@/components/vbrick/stories/xp-toast'
import { getFramework } from '@/lib/vbrick/story-frameworks'
import { neuTheme } from '@/lib/vbrick/theme'
import { cascadeIn, staggerContainer } from '@/lib/vbrick/animations'
import type { StoryType, StoryDraft, VaultEntry, StoryScore } from '@/lib/vbrick/story-types'
import { STORY_TYPE_LABELS } from '@/lib/vbrick/story-types'

type StoryView = 'home' | 'drafting' | 'review' | 'practice' | 'score'
type TabId = 'create' | 'vault' | 'team'

export default function StoryVaultPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('create')
  const [view, setView] = useState<StoryView>('home')

  // Draft state
  const [drafts, setDrafts] = useState<StoryDraft[]>([])
  const [activeDraft, setActiveDraft] = useState<StoryDraft | null>(null)
  const [activeFrameworkType, setActiveFrameworkType] = useState<StoryType | null>(null)

  // Vault state
  const [personalVault, setPersonalVault] = useState<VaultEntry[]>([])
  const [teamVault, setTeamVault] = useState<VaultEntry[]>([])

  // Score state
  const [lastScore, setLastScore] = useState<{ score: StoryScore; isNewBest: boolean; xpEarned: number } | null>(null)

  // Adopt state (for team vault → practice flow)
  const [adoptingId, setAdoptingId] = useState<string | null>(null)

  // XP toast
  const [xpToast, setXPToast] = useState<{ xp: number; visible: boolean }>({ xp: 0, visible: false })

  useEffect(() => {
    const stored = localStorage.getItem('vbrick_email')
    if (stored) setEmail(stored)
  }, [])

  const fetchDrafts = useCallback(async () => {
    if (!email) return
    const res = await fetch(`/api/vbrick/stories/drafts?email=${encodeURIComponent(email)}`)
    if (res.ok) {
      const data = await res.json()
      setDrafts(data.drafts || [])
    }
  }, [email])

  const fetchVault = useCallback(async () => {
    if (!email) return
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
    if (email) {
      fetchDrafts()
      fetchVault()
      fetchTeamVault()
    }
  }, [email, fetchDrafts, fetchVault, fetchTeamVault])

  // Handlers
  const handleSelectFramework = async (type: StoryType) => {
    if (!email) return
    setActiveFrameworkType(type)

    // Create a new draft
    const res = await fetch('/api/vbrick/stories/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, storyType: type, title: STORY_TYPE_LABELS[type] }),
    })
    if (res.ok) {
      const data = await res.json()
      setActiveDraft(data.draft)
      setView('drafting')
    }
  }

  const handleDraftComplete = (draftContent: string) => {
    if (activeDraft) {
      setActiveDraft({ ...activeDraft, draft_content: draftContent })
    }
    setView('review')
  }

  const handleStartPractice = () => setView('practice')

  const handlePracticeComplete = (result: { score: StoryScore; isNewBest: boolean; xpEarned: number }) => {
    setLastScore(result)
    setView('score')
    setXPToast({ xp: result.xpEarned, visible: true })
    fetchVault()
  }

  const handleRetry = () => setView('practice')

  const handleDone = () => {
    setView('home')
    setActiveDraft(null)
    setActiveFrameworkType(null)
    setLastScore(null)
    fetchDrafts()
    fetchVault()
  }

  const handleResumeDraft = (draft: StoryDraft) => {
    setActiveDraft(draft)
    setActiveFrameworkType(draft.story_type as StoryType)
    if (draft.draft_content && draft.status !== 'draft') {
      setView('review')
    } else {
      setView('drafting')
    }
  }

  const handleEditDraft = async (content: string) => {
    if (!activeDraft) return
    await fetch(`/api/vbrick/stories/drafts/${activeDraft.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draft_content: content }),
    })
    setActiveDraft({ ...activeDraft, draft_content: content })
  }

  const handleDeleteVaultEntry = async (entryId: string) => {
    const res = await fetch(`/api/vbrick/stories/vault/${entryId}`, { method: 'DELETE' })
    if (res.ok) {
      fetchVault()
      fetchTeamVault()
    }
  }

  const handleToggleShare = async (entryId: string, currentlyShared: boolean) => {
    await fetch(`/api/vbrick/stories/vault/${entryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shared_to_team: !currentlyShared }),
    })
    fetchVault()
    fetchTeamVault()
  }

  // Practice a story from the user's personal vault
  const handlePracticeFromVault = async (entry: VaultEntry) => {
    if (!email) return

    // Fetch the original draft to get the script content
    const res = await fetch(`/api/vbrick/stories/drafts/${entry.story_draft_id}`)
    if (res.ok) {
      const data = await res.json()
      const draft = data.draft as StoryDraft
      setActiveDraft(draft)
      setActiveFrameworkType(draft.story_type as StoryType)
      setView('practice')
    }
  }

  // Adopt a team story → create a draft copy → go to practice
  const handleAdoptAndPractice = async (entry: VaultEntry) => {
    if (!email) return
    setAdoptingId(entry.id)

    try {
      const res = await fetch('/api/vbrick/stories/drafts/adopt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vault_entry_id: entry.id, email }),
      })

      if (res.ok) {
        const data = await res.json()
        setActiveDraft(data.draft as StoryDraft)
        setActiveFrameworkType(data.draft.story_type as StoryType)
        setView('practice')
      }
    } finally {
      setAdoptingId(null)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: neuTheme.colors.bg }}>
        <NeuCard className="max-w-sm w-full text-center">
          <p className="font-satoshi text-sm mb-4" style={{ color: neuTheme.colors.text.body }}>
            Enter your email to access Story Vault
          </p>
          <input
            type="email"
            className="w-full p-3 rounded-xl text-sm font-satoshi outline-none mb-4"
            style={{ background: neuTheme.colors.bg, boxShadow: neuTheme.shadows.inset, color: neuTheme.colors.text.body }}
            placeholder="you@company.com"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim()
                if (val) {
                  localStorage.setItem('vbrick_email', val)
                  setEmail(val)
                }
              }
            }}
          />
        </NeuCard>
      </div>
    )
  }

  // Sub-views within the story flow
  if (view === 'drafting' && activeDraft && activeFrameworkType) {
    const framework = getFramework(activeFrameworkType)
    if (!framework) return null
    return (
      <div className="min-h-screen p-6" style={{ background: neuTheme.colors.bg }}>
        <button
          onClick={() => { setView('home'); setActiveDraft(null) }}
          className="flex items-center gap-2 mb-6 font-satoshi text-sm"
          style={{ color: neuTheme.colors.text.muted }}
        >
          <ArrowLeft size={16} /> Back to Story Vault
        </button>
        <DraftingWizard
          draftId={activeDraft.id}
          framework={framework}
          onComplete={handleDraftComplete}
          onBack={() => { setView('home'); setActiveDraft(null) }}
        />
      </div>
    )
  }

  if (view === 'review' && activeDraft) {
    return (
      <div className="min-h-screen p-6" style={{ background: neuTheme.colors.bg }}>
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 mb-6 font-satoshi text-sm"
          style={{ color: neuTheme.colors.text.muted }}
        >
          <ArrowLeft size={16} /> Back to Story Vault
        </button>
        <DraftReview
          content={activeDraft.draft_content}
          storyType={activeDraft.story_type as StoryType}
          onStartPractice={handleStartPractice}
          onEdit={handleEditDraft}
        />
      </div>
    )
  }

  if (view === 'practice' && activeDraft && email) {
    return (
      <div className="min-h-screen p-6" style={{ background: neuTheme.colors.bg }}>
        <button
          onClick={() => setView('review')}
          className="flex items-center gap-2 mb-6 font-satoshi text-sm"
          style={{ color: neuTheme.colors.text.muted }}
        >
          <ArrowLeft size={16} /> Back to Draft
        </button>
        <PracticeRecorder
          draftId={activeDraft.id}
          draftContent={activeDraft.draft_content}
          email={email}
          onComplete={handlePracticeComplete}
        />
      </div>
    )
  }

  if (view === 'score' && lastScore) {
    return (
      <div className="min-h-screen p-6" style={{ background: neuTheme.colors.bg }}>
        <ScoreCard
          score={lastScore.score}
          isNewBest={lastScore.isNewBest}
          xpEarned={lastScore.xpEarned}
          onRetry={handleRetry}
          onSaveToVault={handleDone}
        />
        <XPToast xp={xpToast.xp} visible={xpToast.visible} onDone={() => setXPToast(prev => ({ ...prev, visible: false }))} />
      </div>
    )
  }

  // Main home view
  const tabs = [
    { id: 'create' as const, label: 'Draft & Practice', icon: <Rocket size={16} /> },
    { id: 'vault' as const, label: 'My Vault', icon: <Shield size={16} /> },
    { id: 'team' as const, label: 'Team Vault', icon: <BookOpen size={16} /> },
  ]

  return (
    <div className="min-h-screen" style={{ background: neuTheme.colors.bg }}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-general-sans font-bold" style={{ color: neuTheme.colors.text.heading }}>
              Story Vault
            </h1>
            <a
              href="/vbrick/dashboard"
              className="flex items-center gap-2 font-satoshi text-sm"
              style={{ color: neuTheme.colors.text.muted }}
            >
              <ArrowLeft size={16} /> Dashboard
            </a>
          </div>
          <GamificationHeader email={email} />
        </motion.div>

        {/* Tabs */}
        <NeuTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
          className="mb-6"
        />

        {/* Tab Content */}
        {activeTab === 'create' && (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            {/* Active Drafts */}
            {drafts.length > 0 && (
              <motion.div variants={cascadeIn} custom={0} className="mb-8">
                <h2 className="font-general-sans font-semibold text-lg mb-4" style={{ color: neuTheme.colors.text.heading }}>
                  Continue Drafting
                </h2>
                <div className="space-y-3">
                  {drafts.filter(d => d.status !== 'completed').slice(0, 5).map((draft) => (
                    <NeuCard
                      key={draft.id}
                      padding="sm"
                      radius="lg"
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => handleResumeDraft(draft)}
                    >
                      <div>
                        <span className="font-satoshi font-medium text-sm" style={{ color: neuTheme.colors.text.heading }}>
                          {draft.title || STORY_TYPE_LABELS[draft.story_type as StoryType]}
                        </span>
                        <span className="ml-2 text-xs font-satoshi" style={{ color: neuTheme.colors.text.muted }}>
                          {draft.status}
                        </span>
                      </div>
                      <ArrowLeft size={16} style={{ color: neuTheme.colors.text.muted, transform: 'rotate(180deg)' }} />
                    </NeuCard>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Framework Picker */}
            <motion.div variants={cascadeIn} custom={1}>
              <h2 className="font-general-sans font-semibold text-lg mb-4" style={{ color: neuTheme.colors.text.heading }}>
                Start a New Story
              </h2>
              <FrameworkPicker onSelect={handleSelectFramework} />
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'vault' && (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            {personalVault.length === 0 ? (
              <motion.div variants={cascadeIn} custom={0}>
                <NeuCard variant="inset" className="text-center py-12">
                  <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.muted }}>
                    No stories in your vault yet. Record a practice session to add your first story.
                  </p>
                  <NeuButton
                    variant="accent"
                    size="sm"
                    className="mt-4"
                    onClick={() => setActiveTab('create')}
                  >
                    Start Drafting
                  </NeuButton>
                </NeuCard>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {personalVault.map((entry, i) => (
                  <motion.div key={entry.id} variants={cascadeIn} custom={i}>
                    <VaultCard
                      entry={entry}
                      showShare
                      onToggleShare={() => handleToggleShare(entry.id, entry.shared_to_team)}
                      onPractice={() => handlePracticeFromVault(entry)}
                      onDelete={() => handleDeleteVaultEntry(entry.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'team' && (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            {teamVault.length === 0 ? (
              <motion.div variants={cascadeIn} custom={0}>
                <NeuCard variant="inset" className="text-center py-12">
                  <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.muted }}>
                    No team stories shared yet. Share your best stories to help the team.
                  </p>
                </NeuCard>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {teamVault.map((entry, i) => (
                  <motion.div key={entry.id} variants={cascadeIn} custom={i}>
                    <VaultCard
                      entry={entry}
                      showAuthor
                      onAdopt={() => handleAdoptAndPractice(entry)}
                      adopting={adoptingId === entry.id}
                      onDelete={entry.bdr_email === email ? () => handleDeleteVaultEntry(entry.id) : undefined}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <XPToast xp={xpToast.xp} visible={xpToast.visible} onDone={() => setXPToast(prev => ({ ...prev, visible: false }))} />
    </div>
  )
}
