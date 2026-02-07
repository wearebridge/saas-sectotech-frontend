"use client"

import { useParams } from "next/navigation"
import { ScriptsTable } from "@/components/scripts-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ScriptsPage() {
  const params = useParams()
  const subTypeId = params?.id as string
  const serviceId = params?.serviceId as string

  return (
    <div className="flex flex-col gap-8 p-8">
       <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/servicos/${subTypeId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Scripts</h1>
        </div>
      </div>

      <ScriptsTable serviceTypeId={serviceId} />
    </div>
  )
}
