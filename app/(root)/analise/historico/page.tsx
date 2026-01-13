"use client"

import { AnalysisHistory } from "@/components/analysis-history"

function HistoricoPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Análises</h1>
        <p className="text-muted-foreground">
          Visualize o histórico completo de análises realizadas.
        </p>
      </div>
      
      <AnalysisHistory />
    </div>
  )
}

export default HistoricoPage