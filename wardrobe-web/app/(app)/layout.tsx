'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { Onboarding } from '@/components/onboarding/Onboarding'
import { AppHeader } from '@/components/AppHeader'
import { AppProvider } from '@/components/AppContext'
import { AddItemModal } from '@/components/items/AddItemModal'
import { ProfileModal } from '@/components/profile/ProfileModal'
import { Spinner } from '@/components/ui/spinner'
import { useItems } from '@/hooks/useItems'
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

  if (profileQuery.isLoading) return <Loading />

  const profile = profileQuery.data ?? null
  if (!profile || !profile.onboardedAt) {
    return <Onboarding onComplete={input => saveMutation.mutate(input)} />
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

  const itemCount = itemsQuery.data?.length ?? 0
  const savedCount = outfitsQuery.data?.length ?? 0
  const userInitial = user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <AppProvider
      value={{
        colorType,
        openAddItem: () => setAddOpen(true),
        showBreakdown,
        setShowBreakdown,
      }}
    >
      <div className='min-h-svh'>
        <AppHeader
          savedCount={savedCount}
          userInitial={userInitial}
          onAddItem={() => setAddOpen(true)}
          onProfile={() => setProfileOpen(true)}
        />

        {children}

        <AddItemModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
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
      </div>
    </AppProvider>
  )
}
