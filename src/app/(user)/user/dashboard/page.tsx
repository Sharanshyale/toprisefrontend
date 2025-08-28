"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import Dashboard from "@/components/user-dashboard/dashboardcomponents/DashBoard";

export default function Page() {
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    // Redirect Fulfillment-Staff to their specialized fulfillment dashboard
    if (auth?.role === "Fulfillment-Staff") {
      router.replace("/user/dashboard/fulfillment");
    }
              // Redirect Inventory-Staff to product management
          if (auth?.role === "Inventory-Staff") {
            router.replace("/user/dashboard/product");
          }
          // Redirect Inventory-Admin to inventory admin dashboard
          if (auth?.role === "Inventory-Admin") {
            router.replace("/user/dashboard/inventory-admin");
          }
  }, [auth?.role, router]);

  // Show loading or redirect for Fulfillment-Staff
  if (auth?.role === "Fulfillment-Staff") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          <span>Redirecting to Fulfillment Dashboard...</span>
        </div>
      </div>
    );
  }

          // Show loading or redirect for Inventory-Staff
        if (auth?.role === "Inventory-Staff") {
          return (
            <div className="flex items-center justify-center h-96">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                <span>Redirecting to Product Management...</span>
              </div>
            </div>
          );
        }
        // Show loading or redirect for Inventory-Admin
        if (auth?.role === "Inventory-Admin") {
          return (
            <div className="flex items-center justify-center h-96">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                <span>Redirecting to Inventory Admin Dashboard...</span>
              </div>
            </div>
          );
        }

  return (
    <div>
      <Dashboard />
    </div>
  );
}
