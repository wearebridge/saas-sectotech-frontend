"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useKeycloak } from "@/lib/keycloak"
import { Script, ServiceType, ServiceSubType } from "@/types/analysis"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface ScriptSelectorProps {
  onScriptSelect: (script: Script | null) => void
  selectedScript: Script | null
}

export function ScriptSelector({ onScriptSelect, selectedScript }: ScriptSelectorProps) {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [serviceSubTypes, setServiceSubTypes] = useState<ServiceSubType[]>([])
  const [scripts, setScripts] = useState<Script[]>([])
  const [selectedServiceType, setSelectedServiceType] = useState<string>("")
  const [selectedServiceSubType, setSelectedServiceSubType] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { token, authenticated } = useKeycloak()

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const fetchingRef = useRef(false)

  const fetchServiceSubTypes = useCallback(async () => {
    if (!token) return

    try {
      const response = await fetch(`${apiUrl}/service-sub-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Falha ao carregar subtipos de serviço")
      }

      const data = await response.json()
      setServiceSubTypes(data)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar subtipos de serviço")
    }
  }, [token, apiUrl])

  const fetchServiceTypes = useCallback(async (serviceSubTypeId: string) => {
    if (!token || !serviceSubTypeId || fetchingRef.current) return

    setIsLoading(true)
    fetchingRef.current = true
    try {
      const response = await fetch(`${apiUrl}/service-types/byServiceSubType/${serviceSubTypeId}`, {
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
      console.error(error)
      toast.error("Erro ao carregar tipos de serviço")
    } finally {
      setIsLoading(false)
      fetchingRef.current = false
    }
  }, [token, apiUrl])

  const fetchScripts = useCallback(async (serviceTypeId: string) => {
    if (!token || !serviceTypeId || fetchingRef.current) return

    setIsLoading(true)
    fetchingRef.current = true
    try {
      const response = await fetch(`${apiUrl}/scripts/byServiceType/${serviceTypeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Falha ao carregar scripts")
      }

      const data = await response.json()
      setScripts(data)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar scripts")
    } finally {
      setIsLoading(false)
      fetchingRef.current = false
    }
  }, [token, apiUrl])

  useEffect(() => {
    if (authenticated) {
      fetchServiceSubTypes()
    }
  }, [authenticated, fetchServiceSubTypes])

  useEffect(() => {
    if (selectedServiceSubType) {
      setServiceTypes([])
      setScripts([])
      setSelectedServiceType("")
      onScriptSelect(null)
      fetchServiceTypes(selectedServiceSubType)
    }
  }, [selectedServiceSubType]) // Removendo fetchServiceTypes da dependência

  useEffect(() => {
    if (selectedServiceType) {
      setScripts([])
      onScriptSelect(null)
      fetchScripts(selectedServiceType)
    }
  }, [selectedServiceType]) // Removendo fetchScripts da dependência

  const handleScriptSelect = useCallback((scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId)
    onScriptSelect(script || null)
  }, [scripts, onScriptSelect])

  const handleServiceTypeChange = useCallback((serviceTypeId: string) => {
    setSelectedServiceType(serviceTypeId)
  }, [])

  const handleServiceSubTypeChange = useCallback((serviceSubTypeId: string) => {
    setSelectedServiceSubType(serviceSubTypeId)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecionar Script</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Subtipo de Serviço</label>
          <Select value={selectedServiceSubType} onValueChange={handleServiceSubTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um subtipo de serviço" />
            </SelectTrigger>
            <SelectContent>
              {serviceSubTypes.map((subType) => (
                <SelectItem key={subType.id} value={subType.id}>
                  {subType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedServiceSubType && (
          <div>
            <label className="text-sm font-medium">Tipo de Serviço</label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedServiceType} onValueChange={handleServiceTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {selectedServiceType && (
          <div>
            <label className="text-sm font-medium">Script</label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select 
                value={selectedScript?.id || ""} 
                onValueChange={handleScriptSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um script" />
                </SelectTrigger>
                <SelectContent>
                  {scripts.filter(script => script.status).map((script) => (
                    <SelectItem key={script.id} value={script.id}>
                      {script.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}