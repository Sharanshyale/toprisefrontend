"use client"

import * as React from "react"
import {
  Bot,
  Box,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
   LogOutIcon as LogOut,
   LogOutIcon,
   FileText,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {LogOut as logoutAction } from "../store/slice/auth/authSlice"
import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import Cookies from "js-cookie"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { HiOutlineUser } from "react-icons/hi2";
import { SiPhotobucket } from "react-icons/si";
import TicketIcon,{ BoxIcon ,DashboardIcon,userIcon} from "./ui/TicketIcon"
import { title } from "process"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Toprise",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dealer/dashboard",
      icon: DashboardIcon,
    },
    {
      title: "Product Management",
      url: "/dealer/dashboard/product",
      icon: BoxIcon,
    },
    {
      title:"Order Management",
      url: "/dealer/dashboard/order",
      icon: SiPhotobucket ,
    },
    {
      title:"Profile",
      url: "/dealer/dashboard/profile",
      icon: HiOutlineUser,
    },
    {
      title: "Audit Logs",
      url: "/dealer/dashboard/audit-logs",
      icon: FileText,
    }
   
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const router = useRouter()
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)
  const pathname = usePathname();
  const { state } = useSidebar();
  const expanded = state === "expanded";
  // Import persistor from store
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { persistor } = require("@/store/store");
  const handleLogout = () => {
  Cookies.remove('token');
  Cookies.remove('role');
  Cookies.remove('lastlogin');
  localStorage.clear();
  sessionStorage.clear();
  dispatch(logoutAction());
  persistor.purge(); 
  router.replace('/login');
  window.location.reload();
  }

  // Removed debug logs

  // Map navMain to set isActive dynamically
  const navItems = data.navMain.map(item => ({
    ...item,
    isActive:
      pathname === item.url ||
      (item.url !== "/dealer/dashboard" && pathname.startsWith(item.url + "/"))
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent >
        <NavMain items={navItems}  />
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-destructive font-normal text-base gap-2"
          onClick={handleLogout}
        >
          <LogOutIcon className="w-5 h-5" />
          {expanded && "Logout"}
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
