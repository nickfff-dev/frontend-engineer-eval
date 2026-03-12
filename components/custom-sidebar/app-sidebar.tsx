"use client"

import * as React from "react"
import {
  LayoutDashboard,
  ListTodo,
  ClipboardCheck,
  Users,
  Settings,
  TrendingUpIcon,
  PenLineIcon,
  DatabaseSearchIcon,
} from "lucide-react"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"

const ADMIN_ROUTES = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Task Composer', url: '/tasks/composer', icon: PenLineIcon },
  { title: 'Task Management', url: '/tasks/management', icon: ListTodo },
  { title: 'Submissions', url: '/submissions', icon: ClipboardCheck },
  { title: 'User Management', url: '/users', icon: Users },
  { title: 'Performance', url: '/metrics', icon: TrendingUpIcon },
  { title: 'Feed', url: '/feed', icon: DatabaseSearchIcon },
  { title: 'Settings', url: '/settings', icon: Settings },
]

const WORKER_ROUTES = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Tasks', url: '/feed', icon: ListTodo },
  { title: 'Performance', url: '/metrics', icon: TrendingUpIcon },  
  { title: 'Settings', url: '/settings', icon: Settings },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth()
  if (!user) return null

  const routes = user.role === 'admin' ? ADMIN_ROUTES : WORKER_ROUTES

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <NavMain items={routes} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} logOut={logout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}