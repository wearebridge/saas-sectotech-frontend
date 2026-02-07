"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const navMain = [
  { title: "Painel", url: "/" },
  { title: "Scripts", url: "/scripts" },
  { title: "Subtipo de Serviços", url: "/subtipos-servicos" },
  { title: "Usuários", url: "/usuarios" },
  { title: "Clientes", url: "/clientes" },
  { title: "Créditos", url: "/creditos" },
  { title: "Nova análise", url: "/analise" },
];

// nomes customizados
const routeNames: Record<string, string> = {
  tipos: "Tipos do Serviço",
  novo: "Novo",
};

function isId(segment: string) {
  return segment.length > 20 || /^[0-9]+$/.test(segment);
}

export function SiteHeader() {
  const pathname = usePathname();

  const rawSegments = pathname.split("/").filter(Boolean);

  const segments = rawSegments.filter((seg) => !isId(seg));

  const breadcrumbs = segments.map((segment, index) => {
    const url = `/${segments.slice(0, index + 1).join("/")}`;

    const found = navMain.find((item) => item.url === url);

    const title =
      found?.title ??
      routeNames[segment] ??
      segment.charAt(0).toUpperCase() + segment.slice(1);

    return { title, url };
  });

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <h1 className="text-base font-medium flex items-center gap-2">
          {breadcrumbs.length === 0 && "Dashboard"}

          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.url} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}

              {index === breadcrumbs.length - 1 ? (
                <span>{crumb.title}</span>
              ) : (
                <Link href={crumb.url} className="hover:underline">
                  {crumb.title}
                </Link>
              )}
            </span>
          ))}
        </h1>
      </div>
    </header>
  );
}
