"use client"

import { cn } from "@/lib/utils"
import { DynamicIsland } from "./dynamic-island"
import { SidebarNav } from "./sidebar-nav"

interface AppLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-black", className)}>
      {/* Dynamic Island Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4">
        <DynamicIsland className="w-full max-w-md" />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-64 p-4 pt-20">
          <div className="h-full bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Portfolio
              </h2>
              <p className="text-sm text-white/40 mt-1">Design & Engineering</p>
            </div>
            
            <SidebarNav />
            
            {/* Bottom section */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-white/60">Available for work</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 min-h-screen">
          <div className="px-8 py-24">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}