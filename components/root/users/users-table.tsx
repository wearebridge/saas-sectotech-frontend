"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  IconSearch,
  IconLayoutColumns,
  IconPlus,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconChevronDown,
} from "@tabler/icons-react";

import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { columnsUsers } from "./users-columns";
import { User } from "@/types/users";
import UsersForm from "./users-form";
import PasswordResetForm from "./password-reset-form";

import { useKeycloak } from "@/lib/keycloak";
import { IconInput } from "@/components/ui/icon-input";
import { disableUser } from "@/service/users";

export function UsersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [seletedUser, setSeletedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameSearch, setNameSearch] = useState(searchParams.get("name") ?? "");
  const [emailSearch, setEmailSearch] = useState(
    searchParams.get("email") ?? "",
  );
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize") ?? 10),
  );
  const [pageIndex, setPageIndex] = useState(
    Number(searchParams.get("page") ?? 0),
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [openDisableDialog, setOpenDisableDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [userToDisable, setUserToDisable] = useState<User | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

  const handleDisableUser = (user: User) => {
    setUserToDisable(user);
    setOpenDisableDialog(true);
  };

  const handleResetPassword = (user: User) => {
    setUserToResetPassword(user);
    setOpenPasswordDialog(true);
  };

  const confirmDisableUser = async () => {
    if (!token || !userToDisable) return;

    try {
      const response = await disableUser({
        userId: userToDisable.id,
        token,
      });

      if (response instanceof Error) {
        toast.error(response.message);
        return;
      }

      toast.success(
        `Usuário ${userToDisable.firstName} ${userToDisable.lastName} desativado com sucesso!`,
      );
      handleLoadUsers();
    } catch (error) {
      console.error("Erro ao desativar usuário:", error);
      toast.error("Erro ao desativar usuário");
    } finally {
      setOpenDisableDialog(false);
      setUserToDisable(null);
    }
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () =>
      columnsUsers({
        setSeletedUser,
        setOpenDialog,
        onDisableUser: handleDisableUser,
        onResetPassword: handleResetPassword,
        currentUserId,
        isCompanyAdmin,
      }),
    [currentUserId, isCompanyAdmin],
  );

  const { authenticated, token, currentUserId, isCompanyAdmin } = useKeycloak();

  const handleLoadUsers = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiUrl}/companies/current/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error("Falha ao carregar usuários");
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários da empresa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (nameSearch) params.set("name", nameSearch);
    if (emailSearch) params.set("email", emailSearch);
    params.set("page", String(pageIndex));
    params.set("pageSize", String(pageSize));
    router.replace(`?${params.toString()}`);
  }, [nameSearch, emailSearch, pageIndex, pageSize, router]);

  useEffect(() => {
    if (authenticated && token) {
      handleLoadUsers();
    }
  }, [authenticated, token]);

  // Filtrar usuários baseado na busca
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const nameMatch =
        nameSearch === "" ||
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(nameSearch.toLowerCase());
      const emailMatch =
        emailSearch === "" ||
        user.email.toLowerCase().includes(emailSearch.toLowerCase());
      return nameMatch && emailMatch;
    });
  }, [users, nameSearch, emailSearch]);

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <div className="h-8 bg-muted rounded w-[220px]"></div>
              <div className="h-8 bg-muted rounded w-[220px]"></div>
            </div>
            <div className="h-8 bg-muted rounded w-[120px]"></div>
          </div>
          <div className="h-[400px] bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex item center flex-col md:flex-row gap-2 w-full">
            <IconInput
              className="h-8 text-sm"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              StartIcon={IconSearch as any}
              placeholder="Buscar nome"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />

            <IconInput
              className="h-8 text-sm"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              StartIcon={IconSearch as any}
              placeholder="Buscar e-mail"
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns className="h-4 w-4" />
                  <span className="">Colunas</span>
                  <IconChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) => column.getCanHide() && column.id !== "actions",
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

            {isCompanyAdmin && (
              <Button
                variant="sectotech"
                size="sm"
                onClick={() => {
                  setSeletedUser(null);
                  setOpenDialog(true);
                }}
              >
                <IconPlus className="h-4 w-4" />
                <span className="">Novo usuário</span>
              </Button>
            )}
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
                        header.getContext(),
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
                        cell.getContext(),
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
                {[5, 10, 20].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm font-medium">
              Página {pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
                disabled={pageIndex === 0}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setPageIndex((p) => Math.min(p + 1, table.getPageCount() - 1))
                }
                disabled={pageIndex >= table.getPageCount() - 1}
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPageIndex(table.getPageCount() - 1)}
                disabled={pageIndex >= table.getPageCount() - 1}
              >
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog para criar/editar usuário */}
      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) setSeletedUser(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {seletedUser ? "Editar usuário" : "Novo usuário"}
            </DialogTitle>
            <DialogDescription>
              {seletedUser
                ? "Atualize as informações do usuário."
                : "Preencha os dados para criar um novo usuário."}
            </DialogDescription>
          </DialogHeader>
          <UsersForm
            setOpenDialog={setOpenDialog}
            loadUsers={handleLoadUsers}
            token={token}
            onSuccess={handleLoadUsers}
            initalData={seletedUser}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para desativar usuário */}
      <AlertDialog open={openDisableDialog} onOpenChange={setOpenDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o usuário{" "}
              <strong>
                {userToDisable?.firstName} {userToDisable?.lastName}
              </strong>
              ? Ele não poderá mais acessar o sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDisableUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para resetar senha */}
      <Dialog
        open={openPasswordDialog}
        onOpenChange={(open) => {
          setOpenPasswordDialog(open);
          if (!open) setUserToResetPassword(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resetar senha</DialogTitle>
            <DialogDescription>
              Defina uma nova senha para{" "}
              <strong>
                {userToResetPassword?.firstName}{" "}
                {userToResetPassword?.lastName}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>
          <PasswordResetForm
            user={userToResetPassword}
            token={token}
            setOpenDialog={setOpenPasswordDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
