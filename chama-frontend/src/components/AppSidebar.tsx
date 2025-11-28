import React from 'react'
import {
  Home,
  Users,
  DollarSign,
  Banknote,
  Calendar,
  BarChart3,
  PiggyBank
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type Page = 'dashboard' | 'members' | 'contributions' | 'loans' | 'meetings' | 'reports'

interface AppSidebarProps {
  activePage: Page
  onPageChange: (page: Page) => void
}

const menuItems: { title: string; icon: React.ComponentType<any>; page: Page }[] = [
  {
    title: 'Dashboard',
    icon: Home,
    page: 'dashboard' as Page,
  },
  {
    title: 'Members',
    icon: Users,
    page: 'members' as Page,
  },
  {
    title: 'Contributions',
    icon: DollarSign,
    page: 'contributions' as Page,
  },
  {
    title: 'Loans',
    icon: Banknote,
    page: 'loans' as Page,
  },
  {
    title: 'Meetings',
    icon: Calendar,
    page: 'meetings' as Page,
  },
  {
    title: 'Reports',
    icon: BarChart3,
    page: 'reports' as Page,
  },
]

export function AppSidebar({ activePage, onPageChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <PiggyBank className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-lg font-semibold text-[#07d50a] md:text-center">LELA SHG</h1>
            <p className="text-sm text-muted-foreground">Savings & Loans</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.page}>
                    <SidebarMenuButton
                      isActive={activePage === item.page}
                      onClick={() => onPageChange(item.page)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          © 2025 Chama Management System
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
