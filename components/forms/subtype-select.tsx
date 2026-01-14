"use client"

import { useEffect, useState, startTransition } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

type SubType = {
  id: string
  name: string
}

type SubTypeSelectProps = {
  value?: string
  onChange: (value: string) => void
}

export function SubTypeSelect({ value, onChange }: SubTypeSelectProps) {
  const [open, setOpen] = useState(false)
  const [subTypes, setSubTypes] = useState<SubType[]>([])
  const [newSubType, setNewSubType] = useState("")

  useEffect(() => {
    setSubTypes([
      { id: "1", name: "Tributário" },
      { id: "2", name: "Previdenciário" },
    ])
  }, [])

  const selected = subTypes.find((item) => item.id === value)

  const handleCreateSubType = () => {
    const created = {
      id: crypto.randomUUID(),
      name: newSubType,
    }

    setSubTypes((prev) => [...prev, created])
    onChange(created.id)
    setNewSubType("")
  }

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
                    onChange(item.id)
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
