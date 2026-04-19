"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all",
        "outline-none focus-visible:ring-2 focus-visible:ring-[#00D15A] focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-50",
        "text-gray-500 hover:text-gray-700",
        "border border-transparent",
        // Use aria-[selected=true]: and data-[active]: to match Base UI's actual DOM attributes
        "data-[active]:bg-white data-[active]:text-[#0E1B18] data-[active]:shadow-sm data-[active]:border-slate-200",
        "aria-[selected=true]:bg-white aria-[selected=true]:text-[#0E1B18] aria-[selected=true]:shadow-sm aria-[selected=true]:border-slate-200",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
