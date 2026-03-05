"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GripVertical, PlusIcon, Trash2 } from "lucide-react";
import { useKeycloak } from "@/lib/keycloak";
import { getErrorMessage } from "@/lib/errors/error-utils";
import { createScript, updateScript } from "@/service/scripts";
import { CLIENT_FIELD_LABELS, ClientFieldKey } from "@/types/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import type { Control } from "react-hook-form";

const scriptItemSchema = z.object({
  question: z.string().min(1, "O item é obrigatório"),
  linkedClientField: z.string().nullable().optional(),
});

const formSchema = z.object({
  name: z.string().min(2, "Nome do script deve ter pelo menos 2 caracteres"),
  status: z.boolean(),
  scriptItems: z.array(scriptItemSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SortableQuestionItemProps {
  id: string;
  index: number;
  control: Control<FormValues>;
  onRemove: () => void;
}

function SortableQuestionItem({
  id,
  index,
  control,
  onRemove,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-2 items-start border-b pb-4 last:border-0 last:pb-0"
    >
      <button
        type="button"
        className="mt-2 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="grid gap-2 flex-1">
        <FormField
          control={control}
          name={`scriptItems.${index}.question`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Pergunta" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`scriptItems.${index}.linkedClientField`}
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "__none__" ? null : value)
                }
                value={field.value || "__none__"}
              >
                <FormControl>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Vincular a dado do cliente (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">Nenhum vínculo</SelectItem>
                  {(
                    Object.entries(CLIENT_FIELD_LABELS) as [
                      ClientFieldKey,
                      string,
                    ][]
                  ).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="mt-0"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

interface ScriptFormProps {
  serviceTypeId?: string;
  scriptId?: string;
  initialData?: FormValues;
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ScriptForm({
  serviceTypeId,
  scriptId,
  initialData,
  onSuccess,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: ScriptFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useKeycloak();

  // Use controlled state if provided, otherwise internal
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const defaultValues: FormValues = initialData || {
    name: "",
    status: true,
    scriptItems: [],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const isEditing = !!scriptId;

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "scriptItems",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  }

  // Update form values if initialData changes (important for edit mode switching)
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  async function onSubmit(values: FormValues) {
    if (!token) {
      toast.error("Você não está autenticado");
      return;
    }

    try {
      setIsLoading(true);
      if (isEditing) {
        const result = await updateScript({
          name: values.name,
          status: values.status,
          token,
          scriptId: scriptId!,
          scriptItems: values.scriptItems,
        });

        const errorMessage = getErrorMessage(result);
        if (errorMessage) {
          toast.error(errorMessage);
          setIsLoading(false);
          return;
        }

        toast.success(result as string);
      } else {
        const response = await createScript({
          name: values.name,
          status: values.status,
          token,
          serviceTypeId: serviceTypeId!,
          scriptItems: values.scriptItems,
        });

        const errorMessage = getErrorMessage(response);
        if (errorMessage) {
          toast.error(errorMessage);
          setIsLoading(false);
          return;
        }

        toast.success(response as string);
      }

      if (!isEditing) {
        form.reset();
      }
      setOpen(false);
      onSuccess();

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.error(
        `Ocorreu um erro ao ${isEditing ? "atualizar" : "criar"} o script`,
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {isEditing ? (
            <Button variant="outline" size="sm">
              Editar
            </Button>
          ) : (
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Novo Script
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {isEditing ? "Editar Script" : "Criar Script"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite os detalhes do script."
              : "Adicione um novo script para este subtipo de serviço."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 gap-4">
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Script de vendas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-row  items-center space-x-3 space-y-0 rounded-md border p-4">
                      <Checkbox
                        className="cursor-pointer"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />

                      <div className="space-y-1 leading-none">
                        <FormLabel>Ativo</FormLabel>
                        <FormDescription>
                          Este script estará disponível para uso.
                        </FormDescription>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Perguntas do Script</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ question: "", linkedClientField: null })
                  }
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Adicionar Pergunta
                </Button>
              </div>

              <div className="h-[450px] w-full rounded-md border p-4 overflow-y-auto">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                  <SortableContext
                    items={fields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <SortableQuestionItem
                          key={field.id}
                          id={field.id}
                          index={index}
                          control={form.control}
                          onRemove={() => remove(index)}
                        />
                      ))}
                      {fields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum item adicionado.
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>

            </div>

            <div className="shrink-0 pt-2 border-t">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                variant={"sectotech"}
              >
                {isEditing ? "Salvar Alterações" : "Criar Script"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
