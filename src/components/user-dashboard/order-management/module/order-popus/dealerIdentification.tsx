"use client"
import React from "react"
import { X } from "lucide-react"
// Remove unused Button; use DynamicButton when needed
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog" 
import DynamicButton from "@/components/common/button/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
// Removed CreatePicklist import

interface DealerIdentificationProps {
  isOpen: boolean
  onClose: () => void
  orderId?: string
  skus?: Array<{ sku: string; quantity: number; barcode?: string; dealerId?: string }>
  dealerData?: Array<{
    dealerId: string
    legalName: string
    tradeName: string
    address: string
    contactPerson: string
    mobileNumber: string
    email: string
    gstin: string
    pan: string
    state: string
    pincode: string
  }> | {
    dealerId: string
    legalName: string
    tradeName: string
    address: string
    contactPerson: string
    mobileNumber: string
    email: string
    gstin: string
    pan: string
    state: string
    pincode: string
  }
}

export default function DealerIdentification({
  isOpen,
  onClose,
  orderId,
  skus,
  dealerData 
}: DealerIdentificationProps) {
  // Normalize dealerData to array
  const dealers = Array.isArray(dealerData) ? dealerData : dealerData ? [dealerData] : [];
  // Removed createPickOpen and activeDealerId state variables
  
  const getDealerDisplayName = (dealer: any) => {
    const trade = dealer.tradeName || dealer["trade_name"];
    const legal = dealer.legalName || dealer["legal_name"];
    return trade || legal || dealer.contactPerson || dealer.email || "—";
  };
  const getDealerLegalName = (dealer: any) => dealer.legalName || dealer["legal_name"] || "—";
  const getDealerId = (dealer: any) => dealer.dealerId || dealer._id || dealer.id || "—";
  const safeDealerId = (dealer: any): string => {
    if (dealer == null) return ""
    if (typeof dealer === "string") return dealer
    if (typeof dealer === "number") return String(dealer)
    return String(dealer.dealerId || dealer._id || dealer.id || "")
  }
  // Removed defaultSkuListForDealer function
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black bg-opacity-50" />
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto bg-white p-4 sm:p-6 rounded-lg">
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {dealers.map((dealer, idx) => (
            <Card key={dealer.dealerId || idx} className="p-4 sm:p-6 border border-gray-200 shadow-sm">
              <CardContent className="flex flex-col">
                <div className="space-y-2">
                  <CardTitle className="text-lg font-bold text-[#C72920] mb-1 font-sans">Dealer Information</CardTitle>
                  <CardDescription className="mb-2">Dealer Information</CardDescription>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    <div>
                      <span className="font-sans font-medium text-sm text-[#777777]">Dealer ID</span>
                      <p className="font-sans font-bold text-sm text-[#1D1D1B]">{getDealerId(dealer)}</p>
                    </div>
                    <div>
                      <span className="font-sans font-medium text-sm text-[#777777]">Dealer Name</span>
                      <p className="font-sans font-bold text-sm text-[#1D1D1B]">{getDealerDisplayName(dealer)}</p>
                    </div>
                    <div>
                      <span className="font-sans font-medium text-sm text-[#777777]">Legal Name</span>
                      <p className="font-sans font-bold text-sm text-[#1D1D1B]">{getDealerLegalName(dealer)}</p>
                    </div>
                  </div>
      
                  {/* Removed Create Picklist button */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
      {/* Removed CreatePicklist component */}
    </Dialog>
  )
}
