'use client'

import { createContext, useContext } from 'react'
import type { Outfit } from '@/lib/items'
import type { ExcludedApi } from '@/hooks/useExcluded'
import type { OutfitBuilderApi } from '@/hooks/useOutfitBuilder'

export type WardrobeView = 'circular' | 'list'

type AppContextValue = {
  colorType: string | null
  openAddItem: () => void
  openFeedback: () => void
  showBreakdown: boolean
  setShowBreakdown: (value: boolean) => void
  editingOutfit: Outfit | null
  setEditingOutfit: (outfit: Outfit | null) => void
  searchOpen: boolean
  setSearchOpen: (value: boolean) => void
  hiddenOpen: boolean
  setHiddenOpen: (value: boolean) => void
  excluded: ExcludedApi
  builder: OutfitBuilderApi
}

const AppContext = createContext<AppContextValue>({
  colorType: null,
  openAddItem: () => {},
  openFeedback: () => {},
  showBreakdown: true,
  setShowBreakdown: () => {},
  editingOutfit: null,
  setEditingOutfit: () => {},
  searchOpen: false,
  setSearchOpen: () => {},
  hiddenOpen: false,
  setHiddenOpen: () => {},
  excluded: null as unknown as ExcludedApi,
  builder: null as unknown as OutfitBuilderApi,
})

export function AppProvider({
  value,
  children,
}: {
  value: AppContextValue
  children: React.ReactNode
}) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  return useContext(AppContext)
}
