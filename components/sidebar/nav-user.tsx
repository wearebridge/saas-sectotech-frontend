"use client"

import { useEffect, useState } from "react"
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
} from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useKeycloak } from "@/lib/keycloak"
import { useCredit } from "@/lib/credit-context"

interface UserProfile {
  firstName: string
  lastName: string
  email: string
}

export function NavUser({
  user,
}: {
  user: {
    name: string
    credits: number
  }
}) {
  const { isMobile } = useSidebar()
  const { logout, keycloak, token, authenticated } = useKeycloak()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const { credits, loading: creditsLoading } = useCredit()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !keycloak?.tokenParsed || !authenticated) {
        setUserLoading(false)
        return
      }

      try {
        setUserLoading(true)
        
        // Buscar dados do usuário do token
        const tokenParsed = keycloak.tokenParsed as any
        const userInfo: UserProfile = {
          firstName: tokenParsed.given_name || '',
          lastName: tokenParsed.family_name || '',
          email: tokenParsed.email || ''
        }
        setUserProfile(userInfo)
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
      } finally {
        setUserLoading(false)
      }
    }

    fetchUserData()
  }, [token, keycloak, authenticated])

  const displayName = userProfile 
    ? `${userProfile.firstName} ${userProfile.lastName}`.trim() || userProfile.email
    : user.name
    
  const displayCredits = credits !== null ? credits : user.credits
  const loading = userLoading || creditsLoading

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground min-h-[60px]"
            >
              {loading ? (
                <div className="grid flex-1 text-left gap-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ) : (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-base">{displayName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {`${displayCredits} créditos`}
                  </span>
                </div>
              )}
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-2 text-left text-sm">
                {loading ? (
                  <div className="grid flex-1 text-left gap-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ) : (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-base">{displayName}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {userProfile?.email}
                    </span>
                    <span className="text-muted-foreground truncate text-xs font-medium">
                      {`${displayCredits} créditos disponíveis`}
                    </span>
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconCreditCard />
                Ajuda
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <IconLogout />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
