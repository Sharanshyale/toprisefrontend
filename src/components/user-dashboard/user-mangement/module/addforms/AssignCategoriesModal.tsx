"use client"

import { useState, useEffect } from "react"
import { X, Loader2, Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getAllCategories, addAllowedCategories } from "@/service/dealerServices"
import type { Category } from "@/types/dealer-types"
import { useToast } from "@/components/ui/toast"

interface AssignCategoriesModalProps {
  open: boolean
  onClose: () => void
  dealerId: string | null
  dealerName?: string
  currentCategories?: string[]
  onSuccess?: () => void
}

const MODAL_MESSAGES = {
  title: "Assign Categories",
  description: "Select categories to assign to this dealer:",
  loading: "Loading categories...",
  noCategories: "No available categories to assign",
  selectWarning: "Please select at least one category",
  success: "Categories assigned successfully!",
  error: "Failed to assign categories. Please try again.",
  fetchError: "Failed to fetch categories",
} as const

export default function AssignCategoriesModal({
  open,
  onClose,
  dealerId,
  dealerName = "Dealer",
  currentCategories = [],
  onSuccess,
}: AssignCategoriesModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open])

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await getAllCategories()

      if (response.success) {
        const availableCategories = response.data.filter((category) => !currentCategories.includes(category._id))
        setCategories(availableCategories)
      }
    } catch (error) {
      showToast(MODAL_MESSAGES.fetchError, "error")
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSubmit = async () => {
    if (!dealerId || selectedCategories.length === 0) {
      showToast(MODAL_MESSAGES.selectWarning, "warning")
      return
    }

    try {
      setLoading(true)
      const response = await addAllowedCategories(dealerId, selectedCategories)

      if (response.success) {
        showToast(MODAL_MESSAGES.success, "success")
        onSuccess?.()
        handleClose()
      }
    } catch (error) {
      showToast(MODAL_MESSAGES.error, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedCategories([])
    onClose()
  }

  if (!open) return null

  const hasSelectedCategories = selectedCategories.length > 0
  const hasAvailableCategories = categories.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{MODAL_MESSAGES.title}</h2>
            <p className="text-sm text-gray-600 mt-1">for {dealerName}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">{MODAL_MESSAGES.description}</p>

          {categoriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-red-600" />
              <span className="ml-3 text-gray-600">{MODAL_MESSAGES.loading}</span>
            </div>
          ) : !hasAvailableCategories ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-gray-400" />
              </div>
              {MODAL_MESSAGES.noCategories}
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <label
                  key={category._id}
                  htmlFor={category._id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    id={category._id}
                    checked={selectedCategories.includes(category._id)}
                    onCheckedChange={() => handleCategoryToggle(category._id)}
                  />
                  <span className="text-sm font-medium text-gray-700 flex-1">{category.category_name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={handleClose} disabled={loading} className="px-4 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !hasSelectedCategories}
            className="bg-red-600 hover:bg-red-700 text-white px-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Assign Categories ({selectedCategories.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
