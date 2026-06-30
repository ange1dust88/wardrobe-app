'use client'

import { createContext, useContext } from 'react'

type AppContextValue = {
  colorType: string | null
  openAddItem: () => void
}

const AppContext = createContext<AppContextValue>({
  colorType: null,
  openAddItem: () => {},
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
