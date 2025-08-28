"use client"

import type React from "react"
import { X, Package, Users, TrendingUp } from "lucide-react"
import type { Product } from "@/types/product-Types"

interface SuperAdminDealersModalProps {
  open: boolean
  onClose: () => void
  product: Product | null
}

const MODAL_CONSTANTS = {
  TITLE: "Available Dealers",
  CLOSE_LABEL: "Close modal",
  NO_DATA: "N/A",
  STANDARD_PRIORITY: "Standard",
  STOCK_STATUS: {
    IN_STOCK: "In Stock",
    OUT_OF_STOCK: "Out of Stock",
  },
}

const TABLE_HEADERS = [
  { key: "dealer_id", label: "Dealer ID", icon: Users },
  { key: "quantity", label: "Quantity", icon: Package },
  { key: "margin", label: "Margin %", icon: TrendingUp },
  { key: "priority", label: "Priority" },
  { key: "stock_status", label: "Stock Status" },
  { key: "last_update", label: "Last Update" },
]

const SuperAdminDealersModal: React.FC<SuperAdminDealersModalProps> = ({ open, onClose, product }) => {
  if (!open || !product || !product.available_dealers) {
    return null
  }

  const dealerCount = product.available_dealers.length
  const inStockCount = product.available_dealers.filter((dealer) => dealer.inStock).length

  const formatDate = (dateString: string | null) => {
    if (!dateString) return MODAL_CONSTANTS.NO_DATA
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStockStatusStyle = (inStock: boolean) => {
    return inStock ? "bg-green-50 text-green-800 border-black-300" : "bg-gray-50 text-gray-800 border-black-400"
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dealers-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-2 border-black-500">
        <div className="bg-gray-50 border-b-2 border-black-500">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-lg border-2 border-black-500">
                <Users className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h2 id="dealers-modal-title" className="text-2xl font-bold text-gray-900">
                  {MODAL_CONSTANTS.TITLE}
                </h2>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm font-medium text-gray-800">{product.product_name}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Package className="w-4 h-4 mr-1 text-gray-500" />
                      {dealerCount} dealers
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      {inStockCount} in stock
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-transparent hover:border-black-500"
              aria-label={MODAL_CONSTANTS.CLOSE_LABEL}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 border-2 border-black-500 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    {TABLE_HEADERS.map((header) => {
                      const IconComponent = header.icon
                      return (
                        <th
                          key={header.key}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-r border-black-300 last:border-r-0"
                        >
                          <div className="flex items-center space-x-2">
                            {IconComponent && <IconComponent className="w-4 h-4 text-gray-600" />}
                            <span>{header.label}</span>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {product.available_dealers.map((dealer: any, index: number) => (
                    <tr key={`dealer-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap border-r border-black-200">
                        <span className="text-sm font-mono font-medium text-gray-900 bg-gray-50 px-3 py-1 rounded border border-black-300">
                          {dealer.dealers_Ref || MODAL_CONSTANTS.NO_DATA}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-black-200">
                        <span className="font-medium">{dealer.quantity_per_dealer?.toLocaleString() || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-black-200">
                        <span className="font-medium">
                          {dealer.dealer_margin || dealer.aler_margin || MODAL_CONSTANTS.NO_DATA}
                          {(dealer.dealer_margin || dealer.aler_margin) && "%"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-black-200">
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium border border-black-300">
                          {dealer.dealer_priority_override || MODAL_CONSTANTS.STANDARD_PRIORITY}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-black-200">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStockStatusStyle(dealer.inStock)}`}
                        >
                          {dealer.inStock
                            ? MODAL_CONSTANTS.STOCK_STATUS.IN_STOCK
                            : MODAL_CONSTANTS.STOCK_STATUS.OUT_OF_STOCK}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="text-gray-500">{formatDate(dealer.last_stock_update)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t-2 border--500 bg-gray-50">
          <div className="text-sm text-gray-700 font-medium">
            Showing {dealerCount} dealer{dealerCount !== 1 ? "s" : ""} for {product.product_name}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-black-500 rounded-lg hover:bg-gray-50 hover:border-black-600 focus:outline-none focus:ring-2 focus:ring-black-500 focus:ring-offset-2 transition-all duration-200"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border-2 border-black-600 rounded-lg hover:bg-red-700 hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-black-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDealersModal
