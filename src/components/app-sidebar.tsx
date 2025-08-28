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
   SettingsIcon,
   FileText,
   BarChart3,
   Package,
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
import TicketIcon,{ BoxIcon ,DashboardIcon,userIcon} from "./ui/TicketIcon"
import { title } from "process"


//fullFillmen admin and staff
// Role-based sidebar visibility config for scalability
const sidebarVisibilityConfig = {
  'Fulfillment-Admin': {
    hide: ["Dashboard", "Inventory Management", "SLA Violations & Reporting", "Content Management", "Ticket", "Settings", "Reports", "Requests"],
    show: ["Product Management", "User Management", "Payment & Details", "Order Management", "Return Claims", "Audit Logs"],
  },
  'Fulfillment-Staff': {
    hide: ["User Management", "Inventory Management", "SLA Violations & Reporting", "Payment & Details", "Content Management", "Ticket", "Settings", "Audit Logs", "Reports", "Requests"],
    show: ["Dashboard", "Product Management", "Order Management", "Return Claims", "Pickup"],
  },
          'Inventory-Staff': {
          hide: ["Dashboard", "User Management", "Inventory Management", "SLA Violations & Reporting", "Payment & Details", "Order Management", "Return Claims", "Pickup", "Content Management", "Ticket", "Settings", "Audit Logs", "Reports"],
          show: ["Product Management", "Requests"],
        },
        'Inventory-Admin': {
          hide: ["Dashboard", "User Management", "Inventory Management", "SLA Violations & Reporting", "Payment & Details", "Order Management", "Return Claims", "Pickup", "Ticket", "Settings", "Reports"],
          show: ["Product Management", "Requests", "Dealer Management", "Content Management", "Audit Logs"],
        },
  // Add more roles here as needed
};

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
      url: "/user/dashboard",
      icon: DashboardIcon,
    },
    {
      title: "Product Management",
      url: "/user/dashboard/product",
      icon: BoxIcon,
    },
    {
      title: "User Management",
      url: "/user/dashboard/user",
      icon: userIcon,
    },
    {
      title: "Inventory Management",
      url: "/user/dashboard/inventory",
      icon: LayoutDashboard,
    },
    {
      title: "SLA Violations & Reporting",
      url: "/user/dashboard/PricingMarginMangement",
      icon: TicketIcon,
    },
    {
      title: "Payment & Details",
      url: "/user/dashboard/paymentDetails",
      icon: TicketIcon,
    },
    {
      title:"Order Management",
      url: "/user/dashboard/order",
      icon: Bot,
    },
    {
      title:"Return Claims",
      url: "/user/dashboard/returnclaims",
      icon: Box,
    },
    {
      title: "Pickup",
      url: "/user/dashboard/pickup",
      icon: Package,
    },
       {
      title: "Content Management",
      url: "/user/dashboard/contentManagement",
      icon: BoxIcon,
    },
    {
      title: "Ticket ",
      url: "/user/dashboard/tickets",
      icon: TicketIcon,
    },
    {
      title: "Settings",
      url: "/user/dashboard/setting",
      icon: SettingsIcon,
    },
    {
      title: "Audit Logs",
      url: "/user/dashboard/audit-logs",
      icon: FileText,
    },
    {
      title: "Reports",
      url: "/user/dashboard/reports",
      icon: BarChart3,
    },
    {
      title: "Requests",
      url: "/user/dashboard/requests",
      icon: FileText,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const auth = useAppSelector((state) => state.auth.user);
  const router = useRouter()
  const dispatch = useAppDispatch()

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
  router.replace('/admin/login');
  window.location.reload();
  }

  // Removed debug logs

  // Scalable sidebar filtering based on sidebarVisibilityConfig
  const role: string = auth.role;
  let navItems;
  if (sidebarVisibilityConfig[role as keyof typeof sidebarVisibilityConfig]) {
    const { hide = [], show = [] } = sidebarVisibilityConfig[role as keyof typeof sidebarVisibilityConfig];
    navItems = data.navMain
      .filter(item => {
        if (hide.includes(item.title)) return false;
        if (show.length > 0 && !show.includes(item.title)) return false;
        return true;
      })
      .map(item => ({
        ...item,
        isActive:
          pathname === item.url ||
          (item.url !== "/user/dashboard" && pathname.startsWith(item.url + "/"))
      }));
  } else {
    navItems = data.navMain.map(item => ({
      ...item,
      isActive:
        pathname === item.url ||
        (item.url !== "/user/dashboard" && pathname.startsWith(item.url + "/"))
    }));
  }

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
