"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useKeycloak } from "@/lib/keycloak"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Eye, CheckCircle, XCircle, Calendar, User, Search, Filter } from "lucide-react"

interface AnalysisHistoryItem {
  id: string
  clientId?: string
  clientName: string
  clientSurname?: string
  clientCpf?: string
  audioFilename?: string
  transcription?: string
  script: any
  aiOutput: any
  approved: boolean
  createdAt: string
}

export function AnalysisHistory() {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null)
  const [clientSearch, setClientSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { token, authenticated } = useKeycloak()

  const fetchAnalyses = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const url = `${apiUrl}/analysis-results`
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Falha ao carregar histórico de análises")
      }

      const data = await response.json()
      setAnalyses(data)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar histórico de análises")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (authenticated) {
      fetchAnalyses()
    }
  }, [authenticated, fetchAnalyses])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredAnalyses = useMemo(() => {
    return analyses.filter(analysis => {
      const search = clientSearch.trim().toLowerCase()
      const matchesClient = search === "" ||
        (analysis.clientName && analysis.clientName.toLowerCase().includes(search)) ||
        (analysis.clientSurname && analysis.clientSurname.toLowerCase().includes(search)) ||
        (`${analysis.clientName || ''} ${analysis.clientSurname || ''}`.toLowerCase().includes(search)) ||
        (analysis.clientCpf && analysis.clientCpf.replace(/\D/g, '').includes(search.replace(/\D/g, '')))

      const matchesDate = dateFilter === "" || 
        analysis.createdAt.startsWith(dateFilter)
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "approved" && analysis.approved) ||
        (statusFilter === "rejected" && !analysis.approved)
      
      return matchesClient && matchesDate && matchesStatus
    })
  }, [analyses, clientSearch, dateFilter, statusFilter])

  const clearFilters = () => {
    setClientSearch("")
    setDateFilter("")
    setStatusFilter("all")
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (analyses.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <p className="text-muted-foreground">Nenhuma análise encontrada.</p>
          <p className="text-sm text-muted-foreground">Realize uma nova análise para começar.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="clientSearch">Cliente</Label>
              <Input
                id="clientSearch"
                placeholder="Buscar por nome ou CPF"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateFilter">Data</Label>
              <Input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="statusFilter">Status</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="rejected">Reprovados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
          {(clientSearch.trim() !== "" || dateFilter || statusFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              {filteredAnalyses.length} de {analyses.length} resultados encontrados
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Análises</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">Nenhuma análise encontrada com os filtros aplicados.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalyses.map((analysis) => (
                <TableRow key={analysis.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {analysis.clientName} {analysis.clientSurname || ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(analysis.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={analysis.approved ? "default" : "destructive"}>
                      {analysis.approved ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aprovado
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Reprovado
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAnalysis(analysis)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            Detalhes da Análise
                            <Badge variant={analysis.approved ? "default" : "destructive"}>
                              {analysis.approved ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Aprovado
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reprovado
                                </>
                              )}
                            </Badge>
                          </DialogTitle>
                        </DialogHeader>
                        
                        {selectedAnalysis && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Cliente</Label>
                                <p className="text-sm">{selectedAnalysis.clientName} {selectedAnalysis.clientSurname || ""}</p>
                                {selectedAnalysis.clientCpf && (
                                  <p className="text-xs text-muted-foreground">
                                    CPF: {selectedAnalysis.clientCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                                  </p>
                                )}
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Data/Hora</Label>
                                <p className="text-sm">{formatDate(selectedAnalysis.createdAt)}</p>
                              </div>
                            </div>

                            {selectedAnalysis.audioFilename && (
                              <div>
                                <Label className="text-sm font-medium">Arquivo de Áudio</Label>
                                <p className="text-sm text-muted-foreground">{selectedAnalysis.audioFilename}</p>
                              </div>
                            )}

                            {selectedAnalysis.transcription && (
                              <div>
                                <Label className="text-sm font-medium">Transcrição</Label>
                                <div className="p-3 bg-muted rounded-md mt-1">
                                  <p className="text-sm">{selectedAnalysis.transcription}</p>
                                </div>
                              </div>
                            )}

                            {selectedAnalysis.aiOutput?.output && (
                              <div>
                                <Label className="text-sm font-medium">Resultado da Análise</Label>
                                <div className="space-y-3 mt-2">
                                  {selectedAnalysis.aiOutput.output.map((item: any, index: number) => (
                                    <div key={index} className="border rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Pergunta {index + 1}</span>
                                        <Badge variant={item.correct ? "default" : "destructive"}>
                                          {item.correct ? "Correto" : "Incorreto"}
                                        </Badge>
                                      </div>
                                      <div className="space-y-2">
                                        <div>
                                          <span className="text-xs font-medium text-muted-foreground">Pergunta:</span>
                                          <p className="text-sm">{item.question}</p>
                                        </div>
                                        <div>
                                          <span className="text-xs font-medium text-muted-foreground">Resposta:</span>
                                          <p className="text-sm">{item.answer}</p>
                                        </div>
                                        <div>
                                          <span className="text-xs font-medium text-muted-foreground">Análise:</span>
                                          <p className="text-sm">{item.analysis}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}