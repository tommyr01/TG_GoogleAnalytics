"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { 
  BarChart3, 
  Users, 
  FileText, 
  Target, 
  Smartphone, 
  MessageCircle,
  Moon,
  Sun,
  BarChart4
} from "lucide-react"

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/registry/new-york-v4/ui/sidebar"
import { Button } from "@/registry/new-york-v4/ui/button"

const navigationItems = [
  {
    title: "Overview",
    url: "/analytics",
    icon: BarChart4,
  },
  {
    title: "Traffic",
    url: "/analytics/traffic",
    icon: BarChart3,
  },
  {
    title: "Pages",
    url: "/analytics/pages",
    icon: FileText,
  },
  {
    title: "Audience",
    url: "/analytics/audience",
    icon: Users,
  },
  {
    title: "Conversions",
    url: "/analytics/conversions",
    icon: Target,
  },
  {
    title: "Devices",
    url: "/analytics/devices",
    icon: Smartphone,
  },
  {
    title: "Chat",
    url: "/analytics/chat",
    icon: MessageCircle,
  },
]

export function AnalyticsNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white">
            <BarChart4 className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">GA Analytics</span>
            <span className="text-xs text-sidebar-foreground/70">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className="size-4 text-teal-600" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-sidebar-foreground/70">Theme</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 text-teal-600 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 text-teal-600 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </SidebarFooter>
    </>
  )
}