'use client'

import { createContext, useContext } from 'react'
import type { Outfit } from '@/lib/items'
import type { OutfitBuilderApi } from '@/hooks/useOutfitBuilder'

export type WardrobeView = 'circular' | 'list'

type AppContextValue = {
  colorType: string | null
  openAddItem: () => void
  showBreakdown: boolean
  setShowBreakdown: (value: boolean) => void
  editingOutfit: Outfit | null
  setEditingOutfit: (outfit: Outfit | null) => void
  wardrobeView: WardrobeView
  setWardrobeView: (view: WardrobeView) => void
  builder: OutfitBuilderApi
}

const AppContext = createContext<AppContextValue>({
  colorType: null,
  openAddItem: () => {},
  showBreakdown: true,
  setShowBreakdown: () => {},
  editingOutfit: null,
  setEditingOutfit: () => {},
  wardrobeView: 'circular',
  setWardrobeView: () => {},
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
