"use client"

import { DynamicIsland } from "@/components/layout/dynamic-island"

export default function DynamicIslandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <DynamicIsland />
      <div className="pt-20">
        {children}
      </div>
    </>
  )
}