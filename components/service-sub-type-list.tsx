"use client"

import { useEffect, useState, useCallback } from "react"
import { useKeycloak } from "@/lib/keycloak"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import Link from "next/link"

export interface ServiceSubType {
  id: string
  name: string
  description?: string
}

interface ServiceSubTypeListProps {
  serviceTypeId: string
  refreshTrigger?: number
}

export function ServiceSubTypeList({ serviceTypeId, refreshTrigger = 0 }: ServiceSubTypeListProps) {
  const [subTypes, setSubTypes] = useState<ServiceSubType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { token, authenticated } = useKeycloak()

  const fetchSubTypes = useCallback(async () => {
    if (!token || !serviceTypeId) return

    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/service-sub-types/byServiceType/${serviceTypeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Falha ao carregar subtipos de serviço")
      }

      const data = await response.json()
      setSubTypes(data)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar lista de subtipos")
    } finally {
      setIsLoading(false)
    }
  }, [token, serviceTypeId])

  useEffect(() => {
    if (authenticated && serviceTypeId) {
      fetchSubTypes()
    }
  }, [authenticated, serviceTypeId, fetchSubTypes, refreshTrigger])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (subTypes.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">Nenhum subtipo encontrado.</p>
        <p className="text-sm text-muted-foreground">Crie um novo para começar.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {subTypes.map((subType) => (
        <Link href={`/servicos/${serviceTypeId}/${subType.id}`} key={subType.id} className="block h-full"> 
          <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>{subType.name}</CardTitle>
              <CardDescription>{subType.description || "Sem descrição"}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
