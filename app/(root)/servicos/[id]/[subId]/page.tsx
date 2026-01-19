"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import { ScriptList } from "@/components/script-list"
import { ScriptForm } from "@/components/script-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ScriptPage() {
  const params = useParams()
  const id = params?.id as string // ServiceSubTypeId
  const subId = params?.subId as string // ServiceTypeId
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col gap-8 p-8">
       <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/servicos/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Scripts</h1>
          <p className="text-muted-foreground">
            Gerencie os scripts deste serviço.
          </p>
        </div>
        <ScriptForm serviceTypeId={subId} onSuccess={handleCreated} />
      </div>
      
      <ScriptList serviceTypeId={subId} refreshTrigger={refreshTrigger} />
    </div>
  )
}
