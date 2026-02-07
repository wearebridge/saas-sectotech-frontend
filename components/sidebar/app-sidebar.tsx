"use client";

import * as React from "react";
import {
  IconDashboard,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconUsers,
  IconBriefcase,
  IconPigMoney,
  IconHistory,
  IconPackage,
} from "@tabler/icons-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useKeycloak } from "@/lib/keycloak";

const baseData = {
  user: {
    name: "Usuário",
    credits: 1337,
  },
  navMain: [
    {
      title: "Painel",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Histórico",
      url: "/analise/historico",
      icon: IconHistory,
    },
    {
      title: "Scripts",
      url: "/scripts",
      icon: IconListDetails,
    },
    {
      title: "Serviços",
      url: "/servicos",
      icon: IconFolder,
    },
    {
      title: "Usuários",
      url: "/usuarios",
      icon: IconBriefcase,
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: IconUsers,
    },
    {
      title: "Créditos",
      url: "/creditos",
      icon: IconPigMoney,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { keycloak } = useKeycloak();
  const isAdmin = keycloak?.hasRealmRole("SYSTEM_ADMIN");

  const navItems = [...baseData.navMain];

  if (isAdmin) {
    // Only add if not already present (though component re-render recreates the array)
    // Actually we can just push
    if (!navItems.find((item) => item.title === "Gerenciar Pacotes")) {
      navItems.push({
        title: "Gerenciar Pacotes",
        url: "/pacotes",
        icon: IconPackage,
      });
    }
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">SECTOTECH</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={baseData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
