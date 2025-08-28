"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Filter, ChevronDown } from "lucide-react"

interface OrdersFiltersProps {
  currentStatus: string
  onStatusChange: (status: string) => void
  currentPayment: string
  onPaymentChange: (payment: string) => void
  // Legacy compatibility: kept optional to avoid breaking callers still passing these
  currentOrderType?: string
  onOrderTypeChange?: (orderType: string) => void
  currentOrderSource: string
  onOrderSourceChange: (orderSource: string) => void
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

export default function OrdersFilters({
  currentStatus,
  onStatusChange,
  currentPayment,
  onPaymentChange,
  currentOrderSource,
  onOrderSourceChange,
  onResetFilters,
  orders,
}: OrdersFiltersProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const [draftStatus, setDraftStatus] = useState(currentStatus)
  const [draftPayment, setDraftPayment] = useState(currentPayment)
  const [draftOrderSource, setDraftOrderSource] = useState(currentOrderSource)

  const statuses = useMemo(() => {
    const allowedOrder = [
      "Pending",
      "Confirmed",
      "Assigned",
      "Packed",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Returned",
    ]
    const backendSet = new Set<string>()
    orders.forEach((o) => {
      if (o?.status) backendSet.add(String(o.status).toLowerCase())
    })
    const list = allowedOrder.filter((s) => backendSet.has(s.toLowerCase()))
    // Ensure "all" is always the first option to allow clearing filter
    return ["all", ...list]
  }, [orders])

  const payments = useMemo(() => {
    const p = new Set<string>() 
    orders.forEach((o) => {
      if (o?.payment) p.add(String(o.payment))
    })
    return Array.from(p).filter(Boolean).sort()
  }, [orders])

  const orderSources = useMemo(() => {
    const s = new Set<string>(["all"]) 
    orders.forEach((o) => {
      if (o?.orderSource) s.add(String(o.orderSource))
    })
    return Array.from(s).filter(Boolean).sort()
  }, [orders])

  useEffect(() => {
    if (open) {
      setDraftStatus(currentStatus)
      setDraftPayment(currentPayment)
      setDraftOrderSource(currentOrderSource)
    }
  }, [open, currentStatus, currentPayment, currentOrderSource])

  const appliedFiltersCount = useMemo(
    () => (currentStatus && currentStatus !== "all" ? 1 : 0) + (currentPayment !== "all" ? 1 : 0) + (currentOrderSource !== "all" ? 1 : 0),
    [currentStatus, currentPayment, currentOrderSource]
  )

  const applyDraft = () => {
    onStatusChange(draftStatus)
    onPaymentChange(draftPayment)
    onOrderSourceChange(draftOrderSource)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const popoverRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!open || !isDesktop) return
    const onClick = (e: MouseEvent) => {
      if (!popoverRef.current) return
      if (!popoverRef.current.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
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
                  draftStatus={draftStatus}
                  setDraftStatus={setDraftStatus}
                  draftPayment={draftPayment}
                  setDraftPayment={setDraftPayment}
                  draftOrderSource={draftOrderSource}
                  setDraftOrderSource={setDraftOrderSource}
                  statuses={statuses}
                  payments={payments}
                  orderSources={orderSources}
                  onPaymentImmediate={(v) => {
                    onPaymentChange(v)
                  }}
                />
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 h-9 rounded-md bg-black text-white text-sm" onClick={applyDraft}>Apply</button>
                  <button
                    className="flex-1 h-9 rounded-md border text-sm"
                    onClick={() => {
                      setDraftStatus("all")
                      setDraftPayment("all")
                      setDraftOrderSource("all")
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
                  draftStatus={draftStatus}
                  setDraftStatus={setDraftStatus}
                  draftPayment={draftPayment}
                  setDraftPayment={setDraftPayment}
                  draftOrderSource={draftOrderSource}
                  setDraftOrderSource={setDraftOrderSource}
                  statuses={statuses}
                  payments={payments}
                  orderSources={orderSources}
                  onPaymentImmediate={(v) => {
                    onPaymentChange(v)
                  }}
                />
              </div>
              <div className="p-4 border-t flex gap-2">
                <button className="flex-1 h-10 rounded-md bg-black text-white" onClick={applyDraft}>Apply</button>
                <button
                  className="flex-1 h-10 rounded-md border"
                  onClick={() => {
                    setDraftStatus("all")
                    setDraftPayment("all")
                    setDraftOrderSource("all")
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

function PanelContent(props: {
  draftStatus: string
  setDraftStatus: (v: string) => void
  draftPayment: string
  setDraftPayment: (v: string) => void
  draftOrderSource: string
  setDraftOrderSource: (v: string) => void
  statuses: string[]
  payments: string[]
  orderSources: string[]
  onPaymentImmediate?: (v: string) => void
}) {
  const { draftStatus, setDraftStatus, draftPayment, setDraftPayment, draftOrderSource, setDraftOrderSource, statuses, payments, orderSources, onPaymentImmediate } = props
  return (
    <div className="space-y-4">
      <Collapsible title="Status">
        <RadioList name="status" value={draftStatus} onChange={setDraftStatus} options={statuses} labelAll="All Statuses" includeAll={true} />
      </Collapsible>
      <Collapsible title="Payment">
        <RadioList name="payment" value={draftPayment} onChange={(v) => { setDraftPayment(v); onPaymentImmediate?.(v); }} options={payments} labelAll="All Payments" includeAll={false} />
      </Collapsible>
      <Collapsible title="Order Source">
        <RadioList name="orderSource" value={draftOrderSource} onChange={setDraftOrderSource} options={orderSources} labelAll="All Sources" />
      </Collapsible>
    </div>
  )
}

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button className="w-full flex items-center justify-between py-2 text-sm font-medium" onClick={() => setOpen((o) => !o)}>
        {title}
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pt-1">{children}</div>}
    </div>
  )
}

function RadioList({ name, value, onChange, options, labelAll, includeAll = true }: { name: string; value: string; onChange: (v: string) => void; options: string[]; labelAll: string; includeAll?: boolean }) {
  const cleaned = useMemo(() => {
    // ensure "all" first, then others
    const set = new Set(options)
    if (includeAll) set.add("all")
    const arr = Array.from(set)
      .filter(Boolean)
      .sort((a, b) => (a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b)))
    return arr
  }, [options, includeAll])

  return (
    <div className="rounded-md border">
      <ul className="max-h-40 overflow-auto p-1">
        {cleaned.map((opt) => (
          <li key={opt}>
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
              <input type="radio" name={name} checked={value === opt} onChange={() => onChange(opt)} />
              <span className="text-sm">{opt === "all" ? labelAll : opt}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

