"use client"

import { useState } from "react"
import { ServiceSubTypeList } from "@/components/service-sub-type-list"
import { ServiceSubTypeForm } from "@/components/service-sub-type-form"

export default function ServicesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subtipos de Serviço</h1>
        <ServiceSubTypeForm onSuccess={handleCreated} />
      </div>
      
      <ServiceSubTypeList refreshTrigger={refreshTrigger} />
    </div>
  )
}
