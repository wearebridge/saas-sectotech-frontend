"use client"

import { useEffect, useState, startTransition } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useKeycloak } from "@/lib/keycloak"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  CommandList,
} from "@/components/ui/command"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ServiceSubType } from "@/types/service"

type SubTypeSelectProps = {
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function SubTypeSelect({ value, onValueChange, disabled }: SubTypeSelectProps) {
  const [open, setOpen] = useState(false)
  const [subTypes, setSubTypes] = useState<ServiceSubType[]>([])
  const [newSubType, setNewSubType] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const { token, authenticated } = useKeycloak()

  async function handleCreateSubType() {
    if (!token || !newSubType.trim()) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await fetch(`${apiUrl}/service-sub-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newSubType, description: newDescription, status: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to create sub type")
      }

      const created = await response.json()
      setSubTypes((prev) => [...prev, created])
      onValueChange(created.id)
      setNewSubType("")
      setNewDescription("")
      setOpen(false)
    } catch (error) {
      console.error("Error creating sub type:", error)
    }
  }

  useEffect(() => {
    async function fetchSubTypes() {
      if (!token) return

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        const response = await fetch(`${apiUrl}/service-sub-types`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
           throw new Error("Failed to fetch sub types")
        }
        
        const data = await response.json()
        setSubTypes(data)
      } catch (error) {
        console.error("Error fetching sub types:", error)
      }
    }

    if (authenticated) {
        fetchSubTypes()
    }
  }, [token, authenticated])

  const selected = subTypes.find((item) => item.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between",
            !selected && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selected ? selected.name : "Selecione um sub-tipo"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar sub-tipo..." />
          <CommandList>
            <CommandEmpty>Nenhum sub-tipo encontrado.</CommandEmpty>

            <CommandGroup>
              {subTypes.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onValueChange(item.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex w-full items-center px-2 py-2 text-sm hover:bg-muted">
                    + Criar novo sub-tipo
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent className="space-y-8">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Novo sub-tipo</AlertDialogTitle>
                  </AlertDialogHeader>

                  <Input
                    placeholder="Nome do sub-tipo"
                    value={newSubType}
                    onChange={(e) => setNewSubType(e.target.value)}
                  />

                  <Textarea
                    placeholder="Descrição do sub-tipo (opcional)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => startTransition(handleCreateSubType)}
                      disabled={!newSubType.trim()}
                      className="bg-brand text-white hover:bg-brand/90"
                    >
                      Criar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
