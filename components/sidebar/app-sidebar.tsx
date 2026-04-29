"use client";

import * as React from "react";
import {
  IconDashboard,
  IconFolder,
  IconListDetails,
  IconUsers,
  IconBriefcase,
  IconPigMoney,
  IconHistory,
} from "@tabler/icons-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { useKeycloak } from "@/lib/keycloak";

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
import Image from "next/image";

const baseData = {
  user: {
    name: "Usuário",
    credits: 0,
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Histórico de Análises",
      url: "/historico",
      icon: IconHistory,
    },
    {
      title: "Scripts",
      url: "/scripts",
      icon: IconListDetails,
    },
    {
      title: "Subtipo de Serviços",
      url: "/subtipos-servicos",
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

const adminOnlyUrls = ["/", "/scripts", "/subtipos-servicos", "/creditos", "/usuarios"];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isCompanyAdmin } = useKeycloak();

  const navItems = isCompanyAdmin
    ? [...baseData.navMain]
    : baseData.navMain.filter((item) => !adminOnlyUrls.includes(item.url));

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-white! hover:text-inherit! active:bg-white! focus-visible:ring-0! transition-none! duration-0! animate-none!"
            >
              <Link href={isCompanyAdmin ? "/" : "/historico"} className="rounded-md bg-white px-2 py-1">
                <Image
                  src="/logo.jpeg"
                  alt="Logo Listen Solution"
                  width={30}
                  height={30}
                  className="size-7!"
                />
                <span className="text-black font-semibold">
                  Listen Solution
                </span>
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
