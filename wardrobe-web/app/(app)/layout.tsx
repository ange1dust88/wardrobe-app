'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { Onboarding } from '@/components/onboarding/Onboarding'
import { AppHeader } from '@/components/AppHeader'
import { AppProvider } from '@/components/AppContext'
import { FeedbackModal } from '@/components/FeedbackModal'
import { AddItemModal } from '@/components/items/AddItemModal'
import { ProfileModal } from '@/components/profile/ProfileModal'
import { Spinner } from '@/components/ui/spinner'
import type { WardrobeView } from '@/components/AppContext'
import type { Item, Outfit } from '@/lib/items'
import { useItems } from '@/hooks/useItems'
import { useOutfitBuilder } from '@/hooks/useOutfitBuilder'
import { useOutfits } from '@/hooks/useOutfits'
import { useProfile } from '@/hooks/useProfile'

function Loading() {
  return (
    <main className='flex min-h-svh items-center justify-center'>
      <Spinner className='size-6 text-muted-foreground' />
    </main>
  )
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) return <Loading />
  if (!user) return <LoginScreen />
  return <AuthedFrame key={user.id}>{children}</AuthedFrame>
}

function AuthedFrame({ children }: { children: React.ReactNode }) {
  const { profileQuery, saveMutation } = useProfile()

  useItems()
  useOutfits()

  if (profileQuery.isLoading) return <Loading />

  const profile = profileQuery.data ?? null
  if (!profile || !profile.onboardedAt) {
    return (
      <Onboarding
        onComplete={input => saveMutation.mutate(input)}
        saving={saveMutation.isPending}
      />
    )
  }

  return (
    <FrameChrome colorType={profile.palettes[0] ?? null}>{children}</FrameChrome>
  )
}

function FrameChrome({
  colorType,
  children,
}: {
  colorType: string | null
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const [addOpen, setAddOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null)
  const [wardrobeView, setWardrobeView] = useState<WardrobeView>('circular')
  const [showBreakdown, setShowBreakdownState] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('dress:showBreakdown') !== '0'
  })

  function setShowBreakdown(value: boolean) {
    setShowBreakdownState(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dress:showBreakdown', value ? '1' : '0')
    }
  }
  const { itemsQuery, createMutation } = useItems()
  const { outfitsQuery } = useOutfits()
  const builder = useOutfitBuilder()

  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data])
  const itemCount = items.length
  const catCount = new Set(items.map(i => i.category)).size
  const savedCount = outfitsQuery.data?.length ?? 0
  const userInitial = user?.email?.[0]?.toUpperCase() ?? 'U'

  const loadOutfit = builder.load
  const loadedEditRef = useRef<string | null>(null)
  useEffect(() => {
    if (!editingOutfit) {
      loadedEditRef.current = null
      return
    }
    if (items.length === 0) return
    if (loadedEditRef.current === editingOutfit.id) return
    loadedEditRef.current = editingOutfit.id
    const byId = new Map(items.map(i => [i.id, i]))
    const picked = editingOutfit.itemIds
      .map(id => byId.get(id))
      .filter((i): i is Item => i != null)
    loadOutfit(editingOutfit, picked)
  }, [editingOutfit, items, loadOutfit])

  const removeFromBuilder = builder.remove
  const selectedItems = builder.selected
  useEffect(() => {
    if (!itemsQuery.data) return
    const valid = new Set(itemsQuery.data.map(i => i.id))
    for (const it of selectedItems) {
      if (!valid.has(it.id)) removeFromBuilder(it.id)
    }
  }, [itemsQuery.data, selectedItems, removeFromBuilder])

  return (
    <AppProvider
      value={{
        colorType,
        openAddItem: () => setAddOpen(true),
        showBreakdown,
        setShowBreakdown,
        editingOutfit,
        setEditingOutfit,
        wardrobeView,
        setWardrobeView,
        builder,
      }}
    >
      <div className='min-h-svh'>
        <AppHeader
          itemCount={itemCount}
          catCount={catCount}
          savedCount={savedCount}
          userInitial={userInitial}
          view={wardrobeView}
          onView={setWardrobeView}
          onAddItem={() => setAddOpen(true)}
          onFeedback={() => setFeedbackOpen(true)}
          onProfile={() => setProfileOpen(true)}
        />

        {children}

        <AddItemModal
          open={addOpen}
          onClose={() => {
            setAddOpen(false)
            createMutation.reset()
          }}
          onSubmit={(values, callbacks) =>
            createMutation.mutate(values, callbacks)
          }
          pending={createMutation.isPending}
          errorMessage={
            createMutation.error
              ? (createMutation.error as Error).message
              : undefined
          }
        />

        {profileOpen && (
          <ProfileModal
            onClose={() => setProfileOpen(false)}
            itemCount={itemCount}
            outfitCount={savedCount}
          />
        )}

        {feedbackOpen && (
          <FeedbackModal onClose={() => setFeedbackOpen(false)} />
        )}
      </div>
    </AppProvider>
  )
}
