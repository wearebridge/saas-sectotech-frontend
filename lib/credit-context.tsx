"use client"

import { createContext, useContext, ReactNode } from "react"
import { useCompanyCredits } from "@/hooks/use-company-credits"

interface CreditContextType {
  credits: number
  loading: boolean
  refreshCredits: () => Promise<void>
}

const CreditContext = createContext<CreditContextType | undefined>(undefined)

interface CreditProviderProps {
  children: ReactNode
}

export function CreditProvider({ children }: CreditProviderProps) {
  const { credits, loading, refreshCredits } = useCompanyCredits()

  return (
    <CreditContext.Provider value={{
      credits: credits ?? 0,
      loading,
      refreshCredits
    }}>
      {children}
    </CreditContext.Provider>
  )
}

export const useCredit = () => {
  const context = useContext(CreditContext)
  if (context === undefined) {
    throw new Error('useCredit must be used within a CreditProvider')
  }
  return context
}