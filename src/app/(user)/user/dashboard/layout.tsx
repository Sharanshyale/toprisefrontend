"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumb } from "@/components/user-dashboard/DynamicBreadcrumb";
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { WithProtectionRoute } from "@/components/protectionRoute";
import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { NotificationsPanel } from "@/components/notifications/modules/notifications-panel";
import { getAllNotifications } from "@/service/notificationServices";
import { getUserIdFromToken } from "@/utils/auth";



export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  // Background poll for unread count so the bell shows counts even when the panel is closed
  const refreshUnreadCount = useCallback(async () => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        setNotifCount(0);
        return;
      }
      // Get all notifications so we can compute both unread and total.
      const response = await getAllNotifications(userId);
      if (response?.success) {
        const allItems = (response.data || []).filter((n: any) => !n.isUserDeleted);
        const total = allItems.length;
        setNotifCount(total);
      } else {
        setNotifCount(0);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    // initial fetch and then poll quicker
    refreshUnreadCount();
    const intervalId = setInterval(() => {
      if (!isCancelled) refreshUnreadCount();
    }, 5000);

    const handleFocus = () => refreshUnreadCount();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshUnreadCount();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      isCancelled = true;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshUnreadCount]);
  return (
    <WithProtectionRoute redirectTo="/login">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <DynamicBreadcrumb />
            </div>
            <div className="ml-auto px-4">
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative rounded-full p-2 hover:bg-gray-100 transition-colors"
                aria-label="Open notifications"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                <span
                  className={`absolute -top-1 -right-1 rounded-full min-w-4 h-4 px-1 flex items-center justify-center text-[10px] leading-none ${
                    notifCount > 0 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {notifCount}
                </span>
              </button>
            </div>
          </header>
          <NotificationsPanel
            open={isNotifOpen}
            onOpenChange={(open) => {
              setIsNotifOpen(open);
              if (!open) {
                // refresh count when panel closes after actions
                refreshUnreadCount();
              }
            }}
            onCountUpdate={setNotifCount}
          />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </WithProtectionRoute>
  );
}
