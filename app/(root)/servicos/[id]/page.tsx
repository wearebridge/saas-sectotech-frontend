"use client"

import { useParams } from "next/navigation"
import { ServiceTypeList } from "@/components/service-type-list"
import { ServiceTypeForm } from "@/components/service-type-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"

export default function ServiceTypesPage() {
  const params = useParams()
  const id = params?.id as string // This is ServiceSubTypeId (Category ID)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreated = () => {
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
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
        </div>
        <ServiceTypeForm serviceSubTypeId={id} onSuccess={handleCreated} />
      </div>

      <ServiceTypeList serviceSubTypeId={id} refreshTrigger={refreshTrigger} />
    </div>
  )
}
