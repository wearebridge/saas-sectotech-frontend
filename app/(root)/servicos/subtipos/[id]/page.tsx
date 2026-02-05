"use client"

import { useParams } from "next/navigation"
import { ServicesTable } from "@/components/services-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ServiceTypesPage() {
  const params = useParams()
  const id = params?.id as string // This is ServiceSubTypeId (Category ID)

  return (
    <div className="flex flex-col gap-8 p-8">
       <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/servicos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Tipos de Serviços</h1>
        </div>
      </div>

      <ServicesTable serviceSubTypeId={id} />
    </div>
  )
}

