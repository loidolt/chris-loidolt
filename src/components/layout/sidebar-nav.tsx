"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Briefcase, User, Code2, MessageSquare, Layers } from "lucide-react"

interface SidebarNavProps {
  className?: string
}

const navItems = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "projects", label: "Projects", icon: Briefcase, href: "/projects" },
  { id: "about", label: "About", icon: User, href: "/about" },
  { id: "skills", label: "Skills", icon: Code2, href: "/skills" },
  { id: "services", label: "Services", icon: Layers, href: "/services" },
  { id: "contact", label: "Contact", icon: MessageSquare, href: "/contact" },
]

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("space-y-2", className)}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
              "hover:bg-white/5 hover:backdrop-blur-sm",
              "group relative overflow-hidden",
              isActive && "bg-white/10 backdrop-blur-sm"
            )}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0",
              "translate-x-[-100%] group-hover:translate-x-[100%]",
              "transition-transform duration-700 ease-out"
            )} />
            
            <Icon className={cn(
              "w-5 h-5 transition-colors",
              isActive ? "text-white" : "text-white/60 group-hover:text-white/80"
            )} />
            
            <span className={cn(
              "font-medium transition-colors",
              isActive ? "text-white" : "text-white/60 group-hover:text-white/80"
            )}>
              {item.label}
            </span>
            
            {isActive && (
              <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}