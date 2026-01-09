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

export interface ServiceType {
  id: string
  name: string
  description?: string
}

interface ServiceTypeListProps {
  refreshTrigger: number
}

export function ServiceTypeList({ refreshTrigger }: ServiceTypeListProps) {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { token, authenticated } = useKeycloak()

  const fetchServiceTypes = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/service-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Falha ao carregar tipos de serviço")
      }

      const data = await response.json()
      setServiceTypes(data)
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar lista de serviços")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (authenticated) {
      fetchServiceTypes()
    }
  }, [authenticated, fetchServiceTypes, refreshTrigger])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (serviceTypes.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">Nenhum tipo de serviço encontrado.</p>
        <p className="text-sm text-muted-foreground">Crie um novo para começar.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {serviceTypes.map((service) => (
        <Link href={`/servicos/${service.id}`} key={service.id} className="block h-full">
          <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{service.description || "Sem descrição"}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  )
}
