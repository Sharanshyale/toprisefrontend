"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Filter, ChevronDown } from "lucide-react"

interface OrderFiltersProps {
  search: string
  onSearchChange: (search: string) => void
  currentStatus: string
  onStatusChange: (status: string) => void
  currentPayment: string
  onPaymentChange: (payment: string) => void
  onResetFilters: () => void
  orders: any[]
}

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

export default function OrderFilters({
  search,
  onSearchChange,
  currentStatus,
  onStatusChange,
  currentPayment,
  onPaymentChange,
  onResetFilters,
  orders,
}: OrderFiltersProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  // Draft state so users can tweak before applying
  const [draftSearch, setDraftSearch] = useState(search)
  const [draftStatus, setDraftStatus] = useState(currentStatus)
  const [draftPayment, setDraftPayment] = useState(currentPayment)

  // Extract unique filter options from orders
  const statuses = useMemo(() => {
    const set = new Set<string>()
    orders?.forEach((o: any) => {
      if (o?.status) set.add(String(o.status))
    })
    return Array.from(set).sort()
  }, [orders])

  const payments = useMemo(() => {
    const set = new Set<string>()
    orders?.forEach((o: any) => {
      if (o?.payment) set.add(String(o.payment))
    })
    return Array.from(set).sort()
  }, [orders])

  // Sync when opened
  useEffect(() => {
    if (open) {
      setDraftSearch(search)
      setDraftStatus(currentStatus)
      setDraftPayment(currentPayment)
    }
  }, [open, search, currentStatus, currentPayment])

  const appliedFiltersCount = useMemo(
    () => (search ? 1 : 0) + (currentStatus !== "all" ? 1 : 0) + (currentPayment !== "all" ? 1 : 0),
    [search, currentStatus, currentPayment]
  )

  const applyDraft = () => {
    onSearchChange(draftSearch)
    onStatusChange(draftStatus)
    onPaymentChange(draftPayment)
    setOpen(false)
  }

  // ESC to close
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Outside click close for desktop popover
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
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        aria-expanded={open}
      >
        <Filter className="size-4" /> Filters{appliedFiltersCount > 0 ? ` (${appliedFiltersCount})` : ""}
      </button>

      {open && (
        isDesktop ? (
          <div ref={popoverRef} className="relative">
            <div className="absolute right-0 z-50 w-[340px] rounded-md border bg-white shadow-md">
              <div className="p-4 space-y-4">
                <PanelContent
                  draftSearch={draftSearch}
                  setDraftSearch={setDraftSearch}
                  draftStatus={draftStatus}
                  setDraftStatus={setDraftStatus}
                  draftPayment={draftPayment}
                  setDraftPayment={setDraftPayment}
                  statuses={statuses}
                  payments={payments}
                />
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 h-9 rounded-md bg-black text-white text-sm" onClick={applyDraft}>
                    Apply
                  </button>
                  <button
                    className="flex-1 h-9 rounded-md border text-sm"
                    onClick={() => {
                      setDraftSearch("")
                      setDraftStatus("all")
                      setDraftPayment("all")
                      onResetFilters()
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
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
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
                  draftPayment={draftPayment}
                  setDraftPayment={setDraftPayment}
                  statuses={statuses}
                  payments={payments}
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
                    setDraftPayment("all")
                    onResetFilters()
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

function PanelContent(props: {
  draftSearch: string
  setDraftSearch: (v: string) => void
  draftStatus: string
  setDraftStatus: (v: string) => void
  draftPayment: string
  setDraftPayment: (v: string) => void
  statuses: string[]
  payments: string[]
}) {
  const { draftStatus, setDraftStatus, draftPayment, setDraftPayment, statuses, payments } = props

  return (
    <div className="space-y-4">
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
            {statuses.map((s) => (
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

      <Collapsible title="Payment">
        <div className="rounded-md border">
          <ul className="max-h-40 overflow-auto p-1">
            <li>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                <input
                  type="radio"
                  name="payment"
                  checked={draftPayment === "all"}
                  onChange={() => setDraftPayment("all")}
                />
                <span className="text-sm">All Payments</span>
              </label>
            </li>
            {payments.map((p) => (
              <li key={p}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                  <input
                    type="radio"
                    name="payment"
                    checked={draftPayment === p}
                    onChange={() => setDraftPayment(p)}
                  />
                  <span className="text-sm">{p}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </Collapsible>
    </div>
  )
}


