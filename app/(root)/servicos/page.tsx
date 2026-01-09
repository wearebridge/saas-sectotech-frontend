"use client"

import React, { useState } from 'react'
import { ServiceTypeForm } from "@/components/service-type-form"
import { ServiceTypeList } from "@/components/service-type-list"

function ServicesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
        <ServiceTypeForm onSuccess={handleSuccess} />
      </div>
      
      <ServiceTypeList refreshTrigger={refreshTrigger} />
    </div>
  )
}

export default ServicesPage