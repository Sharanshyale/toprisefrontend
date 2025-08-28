// "use client"

// import * as React from "react"

// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "@/components/ui/drawer"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Separator } from "@/components/ui/separator"
// import { Slider } from "@/components/ui/slider"
// import { cn } from "@/lib/utils"
// import { Filter, SlidersHorizontal, X } from 'lucide-react'
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// type YearRange = [number, number]

// const CURRENT_YEAR = new Date().getFullYear()
// const DEFAULT_YEAR_RANGE: YearRange = [2015, CURRENT_YEAR]

// const ALL_BRANDS = [
//   "Apple",
//   "Samsung",
//   "Sony",
//   "LG",
//   "Dell",
//   "HP",
//   "Lenovo",
//   "Asus",
//   "Acer",
//   "Microsoft",
//   "Google",
//   "OnePlus",
//   "Xiaomi",
//   "Nokia",
//   "Canon",
//   "Nikon",
//   "Panasonic",
//   "Philips",
//   "Bose",
//   "JBL",
// ]

// const CATEGORIES = ["Phones", "Laptops", "Audio", "Cameras", "TVs"] as const
// type Category = (typeof CATEGORIES)[number]

// const SUBCATEGORIES_BY_CATEGORY: Record<Category, string[]> = {
//   Phones: ["Android", "iOS", "Feature Phone", "Refurbished"],
//   Laptops: ["Ultrabook", "Gaming", "2-in-1", "Workstation"],
//   Audio: ["Headphones", "Earbuds", "Speakers", "Soundbars"],
//   Cameras: ["DSLR", "Mirrorless", "Point & Shoot", "Action Cam"],
//   TVs: ["OLED", "QLED", "LED", "Projector"],
// }

// // Helpers
// const union = <T,>(...arrs: T[][]) => Array.from(new Set(arrs.flat()))
// const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

// function useMediaQuery(query: string) {
//   const [matches, setMatches] = React.useState<boolean>(() => {
//     if (typeof window === "undefined") return true
//     return window.matchMedia(query).matches
//   })
//   React.useEffect(() => {
//     const media = window.matchMedia(query)
//     const listener = () => setMatches(media.matches)
//     listener()
//     media.addEventListener("change", listener)
//     return () => media.removeEventListener("change", listener)
//   }, [query])
//   return matches
// }

// export default function Page() {
//   // Applied filters
//   const [brands, setBrands] = React.useState<string[]>([])
//   const [categories, setCategories] = React.useState<Category[]>([])
//   const [subcategories, setSubcategories] = React.useState<string[]>([])
//   const [yearRange, setYearRange] = React.useState<YearRange>(DEFAULT_YEAR_RANGE)

//   // UI state
//   const isDesktop = useMediaQuery("(min-width: 768px)")
//   const [open, setOpen] = React.useState(false)

//   // Draft state (for popover/drawer before Apply)
//   const [draftBrands, setDraftBrands] = React.useState<string[]>(brands)
//   const [draftCategories, setDraftCategories] = React.useState<Category[]>(categories)
//   const [draftSubcategories, setDraftSubcategories] = React.useState<string[]>([])
//   const [draftYears, setDraftYears] = React.useState<YearRange>(yearRange)

//   React.useEffect(() => {
//     if (open) {
//       setDraftBrands(brands)
//       setDraftCategories(categories)
//       setDraftSubcategories(subcategories)
//       setDraftYears(yearRange)
//     }
//   }, [open, brands, categories, subcategories, yearRange])

//   const isDefaultYears = draftYears[0] === DEFAULT_YEAR_RANGE[0] && draftYears[1] === DEFAULT_YEAR_RANGE[1]
//   const appliedIsDefaultYears = yearRange[0] === DEFAULT_YEAR_RANGE[0] && yearRange[1] === DEFAULT_YEAR_RANGE[1]

//   const appliedFiltersCount =
//     brands.length + categories.length + subcategories.length + (appliedIsDefaultYears ? 0 : 1)

//   const clearAll = () => {
//     setBrands([])
//     setCategories([])
//     setSubcategories([])
//     setYearRange(DEFAULT_YEAR_RANGE)
//   }

//   const removeBrand = (brand: string) => {
//     setBrands((prev) => prev.filter((b) => b !== brand))
//   }
//   const removeCategory = (category: Category) => {
//     setCategories((prev) => prev.filter((c) => c !== category))
//     // prune subcategories that no longer belong
//     const allowed = allowedSubcategoriesAfterCategories(categories.filter((c) => c !== category))
//     setSubcategories((prev) => prev.filter((s) => allowed.includes(s)))
//   }
//   const removeSubcategory = (sub: string) => {
//     setSubcategories((prev) => prev.filter((s) => s !== sub))
//   }

//   const resetDraft = () => {
//     setDraftBrands([])
//     setDraftCategories([])
//     setDraftSubcategories([])
//     setDraftYears(DEFAULT_YEAR_RANGE)
//   }

//   const applyDraft = () => {
//     setBrands(draftBrands)
//     setCategories(draftCategories)
//     // Prune subs on apply in case user toggled categories
//     const allowed = allowedSubcategoriesAfterCategories(draftCategories)
//     setSubcategories(draftSubcategories.filter((s) => allowed.includes(s)))
//     setYearRange(draftYears)
//     setOpen(false)
//   }

//   function allowedSubcategoriesAfterCategories(selected: Category[]) {
//     if (selected.length === 0) {
//       // if no categories, all subcategories are available
//       return union(...CATEGORIES.map((c) => SUBCATEGORIES_BY_CATEGORY[c]))
//     }
//     return union(...selected.map((c) => SUBCATEGORIES_BY_CATEGORY[c]))
//   }

//   return (
//     <main className="min-h-[100dvh] bg-white">
//       <section className="container px-4 md:px-6 py-8 space-y-6">
//         <header className="flex flex-col md:flex-row gap-3 md:items-center">
 

//           <div className="md:ml-auto">
//             {isDesktop ? (
//               <Popover open={open} onOpenChange={setOpen}>
//                 <PopoverTrigger asChild>
//                   <Button variant="outline" size="sm" className="gap-2">
//                     <Filter className="size-4" aria-hidden="true" />
//                     Filters {appliedFiltersCount > 0 ? `(${appliedFiltersCount})` : ""}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent align="end" className="w-[340px] p-0">
//                   <FilterContent
//                     draftBrands={draftBrands}
//                     setDraftBrands={setDraftBrands}
//                     draftCategories={draftCategories}
//                     setDraftCategories={setDraftCategories}
//                     draftSubcategories={draftSubcategories}
//                     setDraftSubcategories={setDraftSubcategories}
//                     draftYears={draftYears}
//                     setDraftYears={setDraftYears}
//                     onReset={resetDraft}
//                     onApply={applyDraft}
//                   />
//                 </PopoverContent>
//               </Popover>
//             ) : (
//               <Drawer open={open} onOpenChange={setOpen}>
//                 <DrawerTrigger asChild>
//                   <Button variant="outline" size="sm" className="gap-2">
//                     <Filter className="size-4" aria-hidden="true" />
//                     Filters {appliedFiltersCount > 0 ? `(${appliedFiltersCount})` : ""}
//                   </Button>
//                 </DrawerTrigger>
//                 <DrawerContent className="max-h-[85dvh]">
//                   <DrawerHeader className="text-left">
//                     <DrawerTitle>Filters</DrawerTitle>
//                   </DrawerHeader>
//                   <div className="px-6 pb-2">
//                     <FilterContent
//                       draftBrands={draftBrands}
//                       setDraftBrands={setDraftBrands}
//                       draftCategories={draftCategories}
//                       setDraftCategories={setDraftCategories}
//                       draftSubcategories={draftSubcategories}
//                       setDraftSubcategories={setDraftSubcategories}
//                       draftYears={draftYears}
//                       setDraftYears={setDraftYears}
//                       onReset={resetDraft}
//                       onApply={applyDraft}
//                       compact
//                     />
//                   </div>
//                   <DrawerFooter className="px-6 pt-4">
//                     <div className="flex gap-2">
//                       <Button className="flex-1" onClick={applyDraft}>
//                         Apply
//                       </Button>
//                       <DrawerClose asChild>
//                         <Button className="flex-1" variant="outline">
//                           Close
//                         </Button>
//                       </DrawerClose>
//                     </div>
//                   </DrawerFooter>
//                 </DrawerContent>
//               </Drawer>
//             )}
//           </div>
//         </header>

//         {/* Applied filter chips */}
//         <div className="flex flex-wrap items-center gap-2">
//           {brands.map((b) => (
//             <Badge key={b} variant="secondary" className="pr-1.5" aria-label={`Filter brand: ${b}`}>
//               <span>{b}</span>
//               <button
//                 className="ml-1 inline-flex items-center rounded-sm hover:bg-foreground/10"
//                 aria-label={`Remove ${b}`}
//                 onClick={() => removeBrand(b)}
//               >
//                 <X className="size-3.5" />
//               </button>
//             </Badge>
//           ))}

//           {categories.map((c) => (
//             <Badge key={c} variant="secondary" className="pr-1.5" aria-label={`Filter category: ${c}`}>
//               <span>{c}</span>
//               <button
//                 className="ml-1 inline-flex items-center rounded-sm hover:bg-foreground/10"
//                 aria-label={`Remove ${c}`}
//                 onClick={() => removeCategory(c)}
//               >
//                 <X className="size-3.5" />
//               </button>
//             </Badge>
//           ))}

//           {subcategories.map((s) => (
//             <Badge key={s} variant="secondary" className="pr-1.5" aria-label={`Filter subcategory: ${s}`}>
//               <span>{s}</span>
//               <button
//                 className="ml-1 inline-flex items-center rounded-sm hover:bg-foreground/10"
//                 aria-label={`Remove ${s}`}
//                 onClick={() => removeSubcategory(s)}
//               >
//                 <X className="size-3.5" />
//               </button>
//             </Badge>
//           ))}

//           <Badge variant="outline" className="pr-1.5" aria-label="Filter year range">
//             <span>
//               Years: {yearRange[0]}–{yearRange[1]}
//             </span>
//           </Badge>

//           {(brands.length > 0 ||
//             categories.length > 0 ||
//             subcategories.length > 0 ||
//             !appliedIsDefaultYears) && (
//             <Button variant="ghost" size="sm" onClick={clearAll} className="text-foreground/80">
//               Clear all
//             </Button>
//           )}
//         </div>

//         <Separator />

//         {/* Demo: Results header */}

//       </section>
//     </main>
//   )
// }

// function FilterContent(props: {
//   draftBrands?: string[]
//   setDraftBrands?: (v: string[]) => void
//   draftCategories?: Category[]
//   setDraftCategories?: (v: Category[]) => void
//   draftSubcategories?: string[]
//   setDraftSubcategories?: (v: string[]) => void
//   draftYears?: YearRange
//   setDraftYears?: (v: YearRange) => void
//   onReset?: () => void
//   onApply?: () => void
//   compact?: boolean
// }) {
//   // Provide safe defaults for Next.js
//   const {
//     draftBrands = [],
//     setDraftBrands = () => {},
//     draftCategories = [],
//     setDraftCategories = () => {},
//     draftSubcategories = [],
//     setDraftSubcategories = () => {},
//     draftYears = DEFAULT_YEAR_RANGE,
//     setDraftYears = () => {},
//     onReset = () => {},
//     onApply = () => {},
//     compact = false,
//   } = props

//   const [minYear, maxYear] = draftYears
//   const minAllowed = 1990
//   const maxAllowed = CURRENT_YEAR

//   const toggleBrand = (brand: string) => {
//     setDraftBrands(
//       draftBrands.includes(brand)
//         ? draftBrands.filter((b) => b !== brand)
//         : [...draftBrands, brand]
//     )
//   }

//   const toggleCategory = (cat: Category) => {
//     const next = draftCategories.includes(cat)
//       ? (draftCategories.filter((c) => c !== cat) as Category[])
//       : ([...draftCategories, cat] as Category[])
//     setDraftCategories(next)

//     // prune subcategories that are no longer valid
//     const allowed = next.length
//       ? union(...next.map((c) => SUBCATEGORIES_BY_CATEGORY[c]))
//       : union(...CATEGORIES.map((c) => SUBCATEGORIES_BY_CATEGORY[c]))
//     setDraftSubcategories(draftSubcategories.filter((s) => allowed.includes(s)))
//   }

//   const toggleSubcategory = (sub: string) => {
//     setDraftSubcategories(
//       draftSubcategories.includes(sub)
//         ? draftSubcategories.filter((s) => s !== sub)
//         : [...draftSubcategories, sub]
//     )
//   }

//   const availableSubcategories =
//     draftCategories.length > 0
//       ? union(...draftCategories.map((c) => SUBCATEGORIES_BY_CATEGORY[c]))
//       : union(...CATEGORIES.map((c) => SUBCATEGORIES_BY_CATEGORY[c]))

//   const setMinYear = (value: number) => {
//     const v = clamp(Math.round(value), minAllowed, maxYear)
//     setDraftYears([v, Math.max(v, maxYear)] as YearRange)
//   }
//   const setMaxYear = (value: number) => {
//     const v = clamp(Math.round(value), minYear, maxAllowed)
//     setDraftYears([Math.min(minYear, v), v] as YearRange)
//   }

//   return (
//     <div className={cn("p-4 space-y-4", compact && "p-0")}>
//       {/* Brand */}
//       <div className="space-y-2">
//         <Label className="text-sm font-medium">Brand</Label>
//         <div className="rounded-md border">
//           <ScrollArea className="h-[180px]">
//             <ul className="p-2 space-y-1">
//               {ALL_BRANDS.map((brand) => {
//                 const checked = draftBrands.includes(brand)
//                 return (
//                   <li key={brand}>
//                     <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
//                       <Checkbox
//                         checked={checked}
//                         onCheckedChange={() => toggleBrand(brand)}
//                         aria-label={`Select ${brand}`}
//                       />
//                       <span className="text-sm">{brand}</span>
//                     </label>
//                   </li>
//                 )
//               })}
//             </ul>
//           </ScrollArea>
//         </div>
//       </div>

//       <Separator />

//       {/* Category + Subcategory (collapsible) */}
//       <Accordion type="multiple" defaultValue={["category", "subcategory"]} className="w-full">
//         <AccordionItem value="category">
//           <AccordionTrigger className="text-sm font-medium">Category</AccordionTrigger>
//           <AccordionContent>
//             <div className="rounded-md border">
//               <ScrollArea className="h-[140px]">
//                 <ul className="p-2 space-y-1">
//                   {CATEGORIES.map((cat) => {
//                     const checked = draftCategories.includes(cat)
//                     return (
//                       <li key={cat}>
//                         <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
//                           <Checkbox
//                             checked={checked}
//                             onCheckedChange={() => toggleCategory(cat)}
//                             aria-label={`Select ${cat}`}
//                           />
//                           <span className="text-sm">{cat}</span>
//                         </label>
//                       </li>
//                     )
//                   })}
//                 </ul>
//               </ScrollArea>
//             </div>
//           </AccordionContent>
//         </AccordionItem>

//         <AccordionItem value="subcategory">
//           <AccordionTrigger className="text-sm font-medium">Subcategory</AccordionTrigger>
//           <AccordionContent>
//             <div className="space-y-2">
//               <div className="rounded-md border">
//                 <ScrollArea className="h-[140px]">
//                   <ul className="p-2 space-y-1">
//                     {availableSubcategories.map((sub) => {
//                       const checked = draftSubcategories.includes(sub)
//                       return (
//                         <li key={sub}>
//                           <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
//                             <Checkbox
//                               checked={checked}
//                               onCheckedChange={() => toggleSubcategory(sub)}
//                               aria-label={`Select ${sub}`}
//                             />
//                             <span className="text-sm">{sub}</span>
//                           </label>
//                         </li>
//                       )
//                     })}
//                   </ul>
//                 </ScrollArea>
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 {draftCategories.length > 0
//                   ? "Subcategories limited to selected categories."
//                   : "Select categories to narrow subcategories."}
//               </p>
//             </div>
//           </AccordionContent>
//         </AccordionItem>
//       </Accordion>

//       <Separator />

//       {/* Year range */}
//       <fieldset className="space-y-3">
//         <legend className="text-sm font-medium">Year range</legend>
//         <div className="px-1">
//           <Slider
//             value={[minYear, maxYear]}
//             min={minAllowed}
//             max={maxAllowed}
//             step={1}
//             onValueChange={([lo, hi]) => setDraftYears([lo, hi] as YearRange)}
//             aria-label="Year range"
//           />
//         </div>
//         <div className="grid grid-cols-2 gap-3">
//           <div className="space-y-1.5">
//             <Label htmlFor="min-year">From</Label>
//             <Input
//               id="min-year"
//               type="number"
//               min={minAllowed}
//               max={maxYear}
//               value={minYear}
//               onChange={(e) => setMinYear(Number(e.target.value || minAllowed))}
//             />
//           </div>
//           <div className="space-y-1.5">
//             <Label htmlFor="max-year">To</Label>
//             <Input
//               id="max-year"
//               type="number"
//               min={minYear}
//               max={maxAllowed}
//               value={maxYear}
//               onChange={(e) => setMaxYear(Number(e.target.value || maxAllowed))}
//             />
//           </div>
//         </div>
//         <p className="text-xs text-muted-foreground">
//           Range: {minYear}–{maxYear}
//         </p>
//       </fieldset>

//       <Separator />

//       {/* Actions */}
//       <div className="flex gap-2">
//         <Button className="flex-1" onClick={onApply}>
//           Apply
//         </Button>
//         <Button className="flex-1" variant="outline" onClick={onReset}>
//           Reset
//         </Button>
//       </div>
//     </div>
//   )
// }
