"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  IconCalendar,
  IconSearch,
  IconCheck,
  IconChevronDown,
  IconLayoutColumns,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconDotsVertical,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconEye,
  IconDownload,
} from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useKeycloak } from "@/lib/keycloak"
import { toast } from "sonner"

type AnalysisItem = {
  id: string
  date: Date
  clientId?: string
  clientName: string
  clientCpf?: string
  service: string
  subType: string
  scriptName?: string
  approved: boolean
  creditsUsed?: number
  executedBy?: string
  audioFilename?: string
  audioUrl?: string
  transcription?: string
  aiOutput?: {
    output?: {
      question: string
      answer: string
      correct: boolean
      analysis: string
    }[]
  }
}

interface DashboardTableProps {
  clientId?: string
}

export function DashboardTable({ clientId }: DashboardTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token, authenticated } = useKeycloak()
  const [data, setData] = React.useState<AnalysisItem[]>([])
  const [services, setServices] = React.useState<string[]>([])
  const [subTypes, setSubTypes] = React.useState<string[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = React.useState<AnalysisItem | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false)

  const [date, setDate] = React.useState<Date | undefined>(
    searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined
  )
  const [clientSearch, setClientSearch] = React.useState(
    searchParams.get("client") ?? ""
  )
  const [service, setService] = React.useState(searchParams.get("service") ?? "")
  const [subType, setSubType] = React.useState(searchParams.get("subType") ?? "")
  const [status, setStatus] = React.useState(searchParams.get("status") ?? "all")
  const [pageSize, setPageSize] = React.useState(
    Number(searchParams.get("pageSize") ?? 10)
  )
  const [pageIndex, setPageIndex] = React.useState(
    Number(searchParams.get("page") ?? 0)
  )

  const handleViewAnalysis = (item: AnalysisItem) => {
    setSelectedAnalysis(item)
    setDetailDialogOpen(true)
  }

  const handleDownloadAudio = (item: AnalysisItem) => {
    if (!item.audioUrl) {
      toast.error("Nenhum áudio disponível para esta análise")
      return
    }
    const link = document.createElement("a")
    link.href = item.audioUrl
    link.download = item.audioFilename || "audio"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns: ColumnDef<AnalysisItem>[] = React.useMemo(() => [
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) =>
        format(row.original.date, "dd/MM/yyyy", { locale: ptBR }),
    },
    {
      accessorKey: "clientName",
      header: "Cliente",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.clientName}</span>
      ),
    },
    {
      accessorKey: "service",
      header: "Serviço",
    },
    {
      accessorKey: "subType",
      header: "Sub-tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.subType}
        </Badge>
      ),
    },
    {
      accessorKey: "creditsUsed",
      header: "Créditos",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.creditsUsed != null ? row.original.creditsUsed.toFixed(1) : "-"}
        </span>
      ),
    },
    {
      accessorKey: "executedBy",
      header: "Executado por",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.executedBy || "-"}
        </span>
      ),
    },
    {
      accessorKey: "approved",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="flex items-center gap-1 px-1.5 text-muted-foreground"
        >
          {row.original.approved ? (
            <IconCircleCheckFilled className="h-4 w-4 fill-emerald-500 dark:fill-emerald-400" />
          ) : (
            <IconCircleXFilled className="h-4 w-4 fill-destructive" />
          )}
          {row.original.approved ? "Aprovado" : "Reprovado"}
        </Badge>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <IconDotsVertical className="h-4 w-4 fill-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewAnalysis(row.original)}>
              <IconEye className="mr-2 h-4 w-4" />
              Ver análise
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDownloadAudio(row.original)}
              disabled={!row.original.audioUrl}
            >
              <IconDownload className="mr-2 h-4 w-4" />
              Baixar áudio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [])

  React.useEffect(() => {
    const fetchData = async () => {
      if (!authenticated || !token) return

      try {
        let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/analysis-results`
        if (clientId) {
          url += `?clientId=${clientId}`
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Falha ao carregar dados")
        }

        const result = await response.json()
        const mappedData: AnalysisItem[] = result.map((item: any) => ({
          id: item.id,
          date: new Date(item.createdAt),
          clientId: item.clientId,
          clientName: item.clientName || "-",
          clientCpf: item.clientCpf,
          service: item.serviceTypeName || "-",
          subType: item.serviceSubTypeName || "-",
          scriptName: item.scriptName,
          approved: item.approved,
          creditsUsed: item.creditsUsed,
          executedBy: item.executedBy,
          audioFilename: item.audioFilename,
          audioUrl: item.audioUrl,
          transcription: item.transcription,
          aiOutput: item.aiOutput,
        }))

        // Ordenar por data (mais recente primeiro)
        mappedData.sort((a, b) => b.date.getTime() - a.date.getTime())

        setData(mappedData)

        const uniqueServices = Array.from(new Set(mappedData.map(d => d.service).filter(s => s !== "-"))) as string[]
        const uniqueSubTypes = Array.from(new Set(mappedData.map(d => d.subType).filter(s => s !== "-"))) as string[]
        setServices(uniqueServices)
        setSubTypes(uniqueSubTypes)

      } catch (error) {
        console.error(error)
        toast.error("Erro ao carregar histórico de análises")
      }
    }

    fetchData()
  }, [token, authenticated, clientId])

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      if (date && format(item.date, "yyyy-MM-dd") !== format(date, "yyyy-MM-dd")) return false
      if (clientSearch) {
        const search = clientSearch.trim().toLowerCase()
        const fullName = (item.clientName || '').toLowerCase()
        const cpf = item.clientCpf?.replace(/\D/g, '') || ''
        const searchDigits = search.replace(/\D/g, '')
        if (!fullName.includes(search) && !(searchDigits && cpf.includes(searchDigits))) return false
      }
      if (service && item.service !== service) return false
      if (subType && item.subType !== subType) return false
      
      if (status === "approved") return item.approved
      if (status === "rejected") return !item.approved
      
      return true
    })
  }, [data, date, clientSearch, service, subType, status])

  React.useEffect(() => {
    if (clientId) return // Don't update URL params when filtering by clientId
    const params = new URLSearchParams()
    if (date) params.set("date", date.toISOString())
    if (clientSearch) params.set("client", clientSearch)
    if (service) params.set("service", service)
    if (subType) params.set("subType", subType)
    if (status !== "all") params.set("status", status)
    params.set("page", String(pageIndex))
    params.set("pageSize", String(pageSize))
    router.replace(`?${params.toString()}`)
  }, [
    date,
    clientSearch,
    service,
    subType,
    status,
    pageIndex,
    pageSize,
    clientId,
    router,
  ])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater
      setPageIndex(next.pageIndex)
      setPageSize(next.pageSize)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "justify-start gap-2 text-left font-normal text-sm",
                    !date && "text-muted-foreground"
                  )}
                >
                  <IconCalendar className="h-4 w-4" />
                  {date
                    ? format(date, "dd/MM/yyyy", { locale: ptBR })
                    : "Data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                />
              </PopoverContent>
            </Popover>

            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Buscar por nome ou CPF"
                className="h-8 w-[220px] pl-8 text-sm leading-none"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex w-[200px] items-center justify-between text-sm",
                    !service && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">{service || "Serviço"}</span>
                  <IconChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar serviço..." />
                  <CommandEmpty>Nenhum resultado.</CommandEmpty>
                  <CommandGroup>
                    {services.map((item) => (
                      <CommandItem
                        key={item}
                        value={item}
                        onSelect={() =>
                          setService((prev) =>
                            prev === item ? "" : item
                          )
                        }
                      >
                        <IconCheck
                          className={cn(
                            "mr-2 h-4 w-4",
                            service === item ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="text-sm">{item}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex w-[200px] items-center justify-between text-sm",
                    !subType && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">{subType || "Sub-tipo"}</span>
                  <IconChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar sub-tipo..." />
                  <CommandEmpty>Nenhum resultado.</CommandEmpty>
                  <CommandGroup>
                    {subTypes.map((item) => (
                      <CommandItem
                        key={item}
                        value={item}
                        onSelect={() =>
                          setSubType((prev) =>
                            prev === item ? "" : item
                          )
                        }
                      >
                        <IconCheck
                          className={cn(
                            "mr-2 h-4 w-4",
                            subType === item ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="text-sm">{item}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <Tabs value={status} onValueChange={setStatus} className="ml-2">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="approved">Aprovados</TabsTrigger>
                <TabsTrigger value="rejected">Reprovados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns className="h-4 w-4" />
                  <span className="hidden lg:inline">Colunas</span>
                  <span className="lg:hidden">Colunas</span>
                  <IconChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      column.getCanHide() && column.id !== "actions"
                  )
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {String(column.columnDef.header)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>


          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="px-4 font-medium">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end gap-8 px-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>Linhas por página</span>
            <Select
              value={`${pageSize}`}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm font-medium">
              Página {pageIndex + 1} de {table.getPageCount()}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPageIndex(0)}
              >
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setPageIndex((p) =>
                    Math.min(p + 1, table.getPageCount() - 1)
                  )
                }
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setPageIndex(table.getPageCount() - 1)
                }
              >
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Análise</DialogTitle>
          </DialogHeader>
          {selectedAnalysis && (
            <div className="space-y-6">
              {/* Meta info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Data</Label>
                  <p className="text-sm font-medium">
                    {format(selectedAnalysis.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Executado por</Label>
                  <p className="text-sm font-medium">{selectedAnalysis.executedBy || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Cliente</Label>
                  <p className="text-sm font-medium">
                    {selectedAnalysis.clientName}
                    {selectedAnalysis.clientCpf && (
                      <span className="ml-2 text-muted-foreground font-mono text-xs">
                        {selectedAnalysis.clientCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Créditos utilizados</Label>
                  <p className="text-sm font-medium">
                    {selectedAnalysis.creditsUsed != null ? selectedAnalysis.creditsUsed.toFixed(1) : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Serviço</Label>
                  <p className="text-sm font-medium">{selectedAnalysis.service}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Sub-tipo</Label>
                  <p className="text-sm font-medium">{selectedAnalysis.subType}</p>
                </div>
                {selectedAnalysis.scriptName && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Script</Label>
                    <p className="text-sm font-medium">{selectedAnalysis.scriptName}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Resultado</Label>
                  <Badge
                    variant={selectedAnalysis.approved ? "default" : "destructive"}
                    className="mt-1"
                  >
                    {selectedAnalysis.approved ? "Aprovado" : "Reprovado"}
                  </Badge>
                </div>
              </div>

              {/* Audio */}
              {selectedAnalysis.audioUrl && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Áudio</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <audio controls className="flex-1 h-8" src={selectedAnalysis.audioUrl} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadAudio(selectedAnalysis)}
                      >
                        <IconDownload className="mr-1 h-4 w-4" />
                        Baixar
                      </Button>
                    </div>
                    {selectedAnalysis.audioFilename && (
                      <p className="text-xs text-muted-foreground mt-1">{selectedAnalysis.audioFilename}</p>
                    )}
                  </div>
                </>
              )}

              {/* Transcription */}
              {selectedAnalysis.transcription && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Transcrição</Label>
                    <div className="mt-1 rounded-md bg-muted p-3 max-h-40 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{selectedAnalysis.transcription}</p>
                    </div>
                  </div>
                </>
              )}

              {/* AI Output */}
              {selectedAnalysis.aiOutput?.output && selectedAnalysis.aiOutput.output.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Análise por Pergunta</Label>
                    <div className="space-y-3 mt-2">
                      {selectedAnalysis.aiOutput.output.map((item, index) => (
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
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
