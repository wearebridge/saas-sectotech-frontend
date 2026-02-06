"use client"

import { useEffect, useState, useCallback } from "react"
import { useKeycloak } from "@/lib/keycloak"

interface CompanyCredits {
  id: string
  creditAmount: number
}

export function useCompanyCredits() {
  const { token, keycloak, authenticated } = useKeycloak()
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCredits = useCallback(async () => {
    if (!token || !keycloak?.tokenParsed || !authenticated) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      const tokenParsed = keycloak.tokenParsed as any
      const companyId = tokenParsed.companyId
      
      if (companyId) {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        const response = await fetch(`${apiUrl}/companyCredits/byCompanyId/${companyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data: CompanyCredits = await response.json()
          setCredits(data.creditAmount)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar créditos da empresa:', error)
    } finally {
      setLoading(false)
    }
  }, [token, keycloak, authenticated])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  return {
    credits,
    loading,
    refreshCredits: fetchCredits
  }
}