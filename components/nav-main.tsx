"use client"

import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <Link href="/analise">
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Nova análise"
              className={cn(
                "min-w-8 duration-200 ease-linear transition-colors",
                pathname.startsWith("/analise") 
                  ? "bg-brand text-primary-foreground hover:bg-brand/90 hover:text-primary-foreground"
                  : "hover:bg-primary/10"
              )}
            >
              <IconCirclePlusFilled />
              <span>Nova análise</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          </Link>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = item.url === "/" 
              ? pathname === "/" 
              : pathname.startsWith(item.url)

            return (
              <Link href={item.url} key={item.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    className={cn(
                      "transition-colors",
                      isActive && "bg-brand text-primary-foreground hover:bg-brand/90 hover:text-primary-foreground"
                    )}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
