'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { Onboarding } from '@/components/onboarding/Onboarding'
import { AppRail } from '@/components/AppRail'
import { AppTopStrip } from '@/components/AppTopStrip'
import { PageTransition } from '@/components/PageTransition'
import { AppProvider } from '@/components/AppContext'
import { FeedbackModal } from '@/components/FeedbackModal'
import { AddItemModal } from '@/components/items/AddItemModal'
import { GarmentLoader } from '@/components/GarmentLoader'
import type { Item, Outfit } from '@/lib/items'
import { capture } from '@/lib/analytics'
import { useExcluded } from '@/hooks/useExcluded'
import { useItems } from '@/hooks/useItems'
import { useOutfitBuilder } from '@/hooks/useOutfitBuilder'
import { useOutfits } from '@/hooks/useOutfits'
import { useProfile } from '@/hooks/useProfile'

function Loading() {
  return (
    <main className='flex min-h-svh items-center justify-center'>
      <GarmentLoader label='loading your wardrobe' />
    </main>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <Loading />
  if (!user) return <LoginScreen />
  return <AuthedFrame key={user.id}>{children}</AuthedFrame>
}

function AuthedFrame({ children }: { children: React.ReactNode }) {
  const { profileQuery, saveMutation } = useProfile()
  const { seedMutation } = useItems()
  useOutfits()

  if (profileQuery.isLoading) return <Loading />

  const profile = profileQuery.data ?? null
  if (!profile || !profile.onboardedAt) {
    return (
      <Onboarding
        onComplete={input =>
          saveMutation.mutate(input, {
            onSuccess: () => seedMutation.mutate(),
          })
        }
        saving={saveMutation.isPending}
      />
    )
  }

  return (
    <FrameChrome colorType={profile.palettes[0] ?? null}>
      {children}
    </FrameChrome>
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
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [hiddenOpen, setHiddenOpen] = useState(false)
  const excluded = useExcluded()
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
  const hiddenCount = items.filter(i => excluded.excludedIds.has(i.id)).length
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

  const clearBuilder = builder.clear
  const pathname = usePathname()
  const prevPathRef = useRef(pathname)
  useEffect(() => {
    const prev = prevPathRef.current
    prevPathRef.current = pathname
    const wasWardrobe = prev === '/' || prev === '/list'
    const nowWardrobe = pathname === '/' || pathname === '/list'
    if (wasWardrobe && !nowWardrobe && editingOutfit != null) {
      setEditingOutfit(null)
      clearBuilder()
    }
  }, [pathname, editingOutfit, clearBuilder])

  function exitEditOnHome() {
    if (editingOutfit) {
      setEditingOutfit(null)
      clearBuilder()
    }
  }

  const router = useRouter()
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        router.push('/')
        setSearchOpen(v => !v)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  return (
    <AppProvider
      value={{
        colorType,
        openAddItem: () => setAddOpen(true),
        openFeedback: () => setFeedbackOpen(true),
        showBreakdown,
        setShowBreakdown,
        editingOutfit,
        setEditingOutfit,
        searchOpen,
        setSearchOpen,
        hiddenOpen,
        setHiddenOpen,
        excluded,
        builder,
      }}
    >
      <div className='min-h-svh'>
        <AppRail
          savedCount={savedCount}
          userInitial={userInitial}
          onHome={exitEditOnHome}
          onAddItem={() => setAddOpen(true)}
          onFeedback={() => setFeedbackOpen(true)}
        />

        <div className='flex h-svh flex-col pl-[70px]'>
          <AppTopStrip
            itemCount={itemCount}
            catCount={catCount}
            savedCount={savedCount}
            searchOpen={searchOpen}
            onToggleSearch={() => {
              if (!searchOpen) capture('search_opened')
              setSearchOpen(!searchOpen)
            }}
            hiddenCount={hiddenCount}
            hiddenOpen={hiddenOpen}
            onToggleHidden={() => setHiddenOpen(!hiddenOpen)}
            onAddItem={() => setAddOpen(true)}
          />

          <main className='min-h-0 flex-1 overflow-y-auto'>
            <PageTransition>{children}</PageTransition>
          </main>
        </div>

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

        {feedbackOpen && (
          <FeedbackModal onClose={() => setFeedbackOpen(false)} />
        )}
      </div>
    </AppProvider>
  )
}
