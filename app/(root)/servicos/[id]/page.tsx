"use client"

import { useParams } from "next/navigation"
import { ServiceSubTypeList } from "@/components/service-sub-type-list"
import { ServiceSubTypeForm } from "@/components/service-sub-type-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"

export default function ServiceSubTypesPage() {
  const params = useParams()
  const id = params?.id as string
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSubTypeCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col gap-8 p-8">
       <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/servicos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Subtipos de Serviço</h1>
        </div>
        <ServiceSubTypeForm serviceTypeId={id} onSuccess={handleSubTypeCreated} />
      </div>
      
      <ServiceSubTypeList serviceTypeId={id} refreshTrigger={refreshTrigger} />
    </div>
  )
}
