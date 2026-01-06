"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const navMain = [
  { title: "Painel", url: "/" },
  { title: "Scripts", url: "/scripts" },
  { title: "Serviços", url: "/servicos" },
  { title: "Usuários", url: "/usuarios" },
  { title: "Clientes", url: "/clientes" },
  { title: "Créditos", url: "/creditos" },
  { title: "Nova análise", url: "/analise" },
]

export function SiteHeader() {
  const pathname = usePathname()

  const currentRoute = navMain
    .filter((link) => {
      const isActive =
        (pathname.includes(link.url) && link.url.length > 1) ||
        pathname === link.url

      return isActive
    })
    .sort((a, b) => b.url.length - a.url.length)[0]

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <h1 className="text-base font-medium">
          {currentRoute?.title ?? "Dashboard"}
        </h1>
      </div>
    </header>
  )
}
