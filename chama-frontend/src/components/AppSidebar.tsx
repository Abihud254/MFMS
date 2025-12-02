import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  DollarSign,
  Banknote,
  Calendar,
  BarChart3,
  PiggyBank
} from 'lucide-react';
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
} from '@/components/ui/sidebar';

interface MenuItem {
  title: string;
  icon: React.ComponentType<any>;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/',
  },
  {
    title: 'Members',
    icon: Users,
    path: '/members',
  },
  {
    title: 'Contributions',
    icon: DollarSign,
    path: '/contributions',
  },
  {
    title: 'Loans',
    icon: Banknote,
    path: '/loans',
  },
  {
    title: 'Meetings',
    icon: Calendar,
    path: '/meetings',
  },
  {
    title: 'Reports',
    icon: BarChart3,
    path: '/reports',
  },
];

export function AppSidebar() {
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
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <NavLink to={item.path} end>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                );
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
  );
}
