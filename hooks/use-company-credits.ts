"use client"

import { useEffect, useState, useCallback } from "react"
import { useKeycloak } from "@/lib/keycloak"

interface CompanyCredits {
  id: string
  creditAmount: number
}

export function useCompanyCredits() {
  const { token, keycloak, authenticated } = useKeycloak()
  const [credits, setCredits] = useState<number | null>(0)
  const [loading, setLoading] = useState(true)

  const fetchCredits = useCallback(async () => {
    if (!token || !keycloak?.tokenParsed || !authenticated) {
      setCredits(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      const tokenParsed = keycloak.tokenParsed as any
      const companyId = tokenParsed.companyId
      
      if (!companyId) {
        console.warn('CompanyId not found in token')
        setCredits(0)
        setLoading(false)
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await fetch(`${apiUrl}/companyCredits/byCompanyId/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data: CompanyCredits = await response.json()
        setCredits(data.creditAmount)
      } else if (response.status === 404) {
        // Company doesn't have credits yet, set to 0
        console.info('Company credits not found, initializing with 0')
        setCredits(0)
      } else {
        console.error('Failed to fetch credits:', response.status, response.statusText)
        setCredits(0)
      }
    } catch (error) {
      console.error('Erro ao carregar créditos da empresa:', error)
      setCredits(0)
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