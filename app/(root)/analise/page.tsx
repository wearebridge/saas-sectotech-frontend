"use client"

import { AnalysisForm } from "@/components/analysis-form"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import Link from "next/link"

function Page() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Análise</h1>
          <p className="text-muted-foreground">
            Realize análises de transcrições de áudio usando scripts predefinidos.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/analise/historico">
            <History className="w-4 h-4 mr-2" />
            Ver Histórico
          </Link>
        </Button>
      </div>
      
      <AnalysisForm />
    </div>
  )
}

export default Page