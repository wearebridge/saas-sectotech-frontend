"use client"

import { ServiceSubTypeTable } from "@/components/service-sub-type-table"

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subtipos de Serviço</h1>
      </div>
      
      <ServiceSubTypeTable />
    </div>
  )
}


