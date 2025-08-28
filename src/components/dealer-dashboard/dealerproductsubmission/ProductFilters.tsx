"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Filter, X, ChevronDown } from "lucide-react"

interface ProductFiltersProps {
  search: string
  onSearchChange: (search: string) => void
  currentStatus: string
  onStatusChange: (status: string) => void
  currentCategory: string
  onCategoryChange: (category: string) => void
  currentBrand: string
  onBrandChange: (brand: string) => void
  onResetFilters: () => void
  products: any[] // Product array to extract unique categories and brands
}

const PRODUCT_STATUSES = ["Active", "Disable", "Pending", "Approved", "Rejected"] as const

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    return window.matchMedia(query).matches
  })
  useEffect(() => {
    const media = window.matchMedia(query)
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])
  return matches
}

export default function ProductFilters({
  search,
  onSearchChange,
  currentStatus,
  onStatusChange,
  currentCategory,
  onCategoryChange,
  currentBrand,
  onBrandChange,
  onResetFilters,
  products,
}: ProductFiltersProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  // Draft state for panel
  const [draftSearch, setDraftSearch] = useState(search)
  const [draftStatus, setDraftStatus] = useState(currentStatus)
  const [draftCategory, setDraftCategory] = useState(currentCategory)
  const [draftBrand, setDraftBrand] = useState(currentBrand)

  // Extract unique categories and brands from products
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>()
    products.forEach(product => {
      if (product.category?.category_name) {
        uniqueCategories.add(product.category.category_name)
      }
    })
    return Array.from(uniqueCategories).sort()
  }, [products])

  const brands = useMemo(() => {
    const uniqueBrands = new Set<string>()
    products.forEach(product => {
      if (product.brand?.brand_name) {
        uniqueBrands.add(product.brand.brand_name)
      }
    })
    return Array.from(uniqueBrands).sort()
  }, [products])

  // Sync draft when opened
  useEffect(() => {
    if (open) {
      setDraftSearch(search)
      setDraftStatus(currentStatus)
      setDraftCategory(currentCategory)
      setDraftBrand(currentBrand)
    }
  }, [open, search, currentStatus, currentCategory, currentBrand])

  const appliedFiltersCount = useMemo(
    () => (search ? 1 : 0) + (currentStatus !== "all" ? 1 : 0) + (currentCategory !== "all" ? 1 : 0) + (currentBrand !== "all" ? 1 : 0),
    [search, currentStatus, currentCategory, currentBrand]
  )

  const applyDraft = () => {
    onSearchChange(draftSearch)
    onStatusChange(draftStatus)
    onCategoryChange(draftCategory)
    onBrandChange(draftBrand)
    setOpen(false)
  }

  // Close panel on ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Simple outside click close for desktop popover
  const popoverRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!open || !isDesktop) return
    const onClick = (e: MouseEvent) => {
      if (!popoverRef.current) return
      if (
        !popoverRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open, isDesktop])

  return (
    <div className="relative">
      {/* Filter button */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        aria-expanded={open}
      >
        <Filter className="size-4" /> Filters
        {appliedFiltersCount > 0 ? ` (${appliedFiltersCount})` : ""}
      </button>

      {/* Panel */}
      {open && (
        isDesktop ? (
          <div
            ref={popoverRef}
            className="relative"
          >
            <div className="absolute right-0 z-50 w-[340px] rounded-md border bg-white shadow-md">
              <div className="p-4 space-y-4">
                <PanelContent
                  draftSearch={draftSearch}
                  setDraftSearch={setDraftSearch}
                  draftStatus={draftStatus}
                  setDraftStatus={setDraftStatus}
                  draftCategory={draftCategory}
                  setDraftCategory={setDraftCategory}
                  draftBrand={draftBrand}
                  setDraftBrand={setDraftBrand}
                  categories={categories}
                  brands={brands}
                />
                <div className="flex gap-2 pt-2">
                  <button
                    className="flex-1 h-9 rounded-md bg-black text-white text-sm"
                    onClick={applyDraft}
                  >
                    Apply
                  </button>
                  <button
                    className="flex-1 h-9 rounded-md border text-sm"
                    onClick={() => {
                      setDraftSearch("")
                      setDraftStatus("all")
                      setDraftCategory("all")
                      setDraftBrand("all")
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl bg-white shadow-lg">
              <div className="p-4 border-b">
                <h3 className="text-base font-semibold">Filters</h3>
              </div>
              <div className="px-4 pb-4 pt-3 overflow-y-auto max-h-[65vh]">
                <PanelContent
                  draftSearch={draftSearch}
                  setDraftSearch={setDraftSearch}
                  draftStatus={draftStatus}
                  setDraftStatus={setDraftStatus}
                  draftCategory={draftCategory}
                  setDraftCategory={setDraftCategory}
                  draftBrand={draftBrand}
                  setDraftBrand={setDraftBrand}
                  categories={categories}
                  brands={brands}
                />
              </div>
              <div className="p-4 border-t flex gap-2">
                <button className="flex-1 h-10 rounded-md bg-black text-white" onClick={applyDraft}>
                  Apply
                </button>
                <button
                  className="flex-1 h-10 rounded-md border"
                  onClick={() => {
                    setDraftSearch("")
                    setDraftStatus("all")
                    setDraftCategory("all")
                    setDraftBrand("all")
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}

function SelectLike<T extends string>({
  label,
  value,
  onChange,
  options,
  display,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: T[]
  display: (v: T) => string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  const current = display(value)

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="inline-flex items-center justify-between gap-2 h-9 min-w-[8rem] px-3 rounded-md border text-sm hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{current || label}</span>
        <ChevronDown className="size-4" />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-full rounded-md border bg-white shadow">
          <ul className="max-h-56 overflow-auto py-1 text-sm">
            {options.map((opt) => (
              <li key={opt}>
                <button
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    value === opt ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    onChange(opt)
                    setOpen(false)
                  }}
                >
                  {display(opt)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function PanelContent(props: {
  draftSearch: string
  setDraftSearch: (v: string) => void
  draftStatus: string
  setDraftStatus: (v: string) => void
  draftCategory: string
  setDraftCategory: (v: string) => void
  draftBrand: string
  setDraftBrand: (v: string) => void
  categories: string[]
  brands: string[]
}) {
  const { 
    draftSearch, 
    setDraftSearch, 
    draftStatus, 
    setDraftStatus, 
    draftCategory, 
    setDraftCategory, 
    draftBrand, 
    setDraftBrand,
    categories,
    brands
  } = props

  return (
    <div className="space-y-4">
      {/* Collapsible Status */}
      <Collapsible title="Status">
        <div className="rounded-md border">
          <ul className="max-h-40 overflow-auto p-1">
            <li>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                <input
                  type="radio"
                  name="status"
                  checked={draftStatus === "all"}
                  onChange={() => setDraftStatus("all")}
                />
                <span className="text-sm">All Statuses</span>
              </label>
            </li>
            {PRODUCT_STATUSES.map((s) => (
              <li key={s}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                  <input
                    type="radio"
                    name="status"
                    checked={draftStatus === s}
                    onChange={() => setDraftStatus(s)}
                  />
                  <span className="text-sm">{s}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </Collapsible>

      {/* Collapsible Category */}
      <Collapsible title="Category">
        <div className="rounded-md border">
          <ul className="max-h-40 overflow-auto p-1">
            <li>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                <input
                  type="radio"
                  name="category"
                  checked={draftCategory === "all"}
                  onChange={() => setDraftCategory("all")}
                />
                <span className="text-sm">All Categories</span>
              </label>
            </li>
            {categories.map((c) => (
              <li key={c}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                  <input
                    type="radio"
                    name="category"
                    checked={draftCategory === c}
                    onChange={() => setDraftCategory(c)}
                  />
                  <span className="text-sm">{c}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </Collapsible>

      {/* Collapsible Brand */}
      <Collapsible title="Brand">
        <div className="rounded-md border">
          <ul className="max-h-40 overflow-auto p-1">
            <li>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                <input
                  type="radio"
                  name="brand"
                  checked={draftBrand === "all"}
                  onChange={() => setDraftBrand("all")}
                />
                <span className="text-sm">All Brands</span>
              </label>
            </li>
            {brands.map((b) => (
              <li key={b}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                  <input
                    type="radio"
                    name="brand"
                    checked={draftBrand === b}
                    onChange={() => setDraftBrand(b)}
                  />
                  <span className="text-sm">{b}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </Collapsible>
    </div>
  )
}

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        className="w-full flex items-center justify-between py-2 text-sm font-medium"
        onClick={() => setOpen((o) => !o)}
      >
        {title}
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pt-1">{children}</div>}
    </div>
  )
}
