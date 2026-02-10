"use client";

import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();

  /**
   * Descobre qual é o item mais específico da rota atual.
   */
  const activeItem = React.useMemo(() => {
    const matches = items.filter(
      (item) =>
        pathname === item.url ||
        (item.url.length > 1 && pathname.includes(item.url)),
    );

    if (!matches.length) return null;

    return matches.sort((a, b) => b.url.length - a.url.length)[0];
  }, [pathname, items]);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Nova análise */}
        <SidebarMenu>
          <Link href="/analise">
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Nova análise"
                className="bg-brand text-primary-foreground hover:bg-brand/90 hover:text-primary-foreground active:bg-brand/90 active:text-primary-foreground min-w-8 duration-200 ease-linear cursor-pointer"
              >
                <IconCirclePlusFilled />
                <span>Nova análise</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Link>
        </SidebarMenu>

        {/* Itens principais */}
        <SidebarMenu>
          {items.map((item) => {
            const isActive = activeItem?.url === item.url;

            return (
              <Link href={item.url} key={item.title}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    className="cursor-pointer"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
