"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Home, Briefcase, User, MessageSquare, Code2, Palette } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DynamicIslandProps {
  className?: string
}

export function DynamicIsland({ className }: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "projects", label: "Projects", icon: Briefcase, href: "#projects" },
    { id: "about", label: "About", icon: User, href: "#about" },
    { id: "skills", label: "Skills", icon: Code2, href: "#skills" },
    { id: "contact", label: "Contact", icon: MessageSquare, href: "#contact" },
  ]

  return (
    <motion.div
      className={cn(
        "w-full",
        className
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className={cn(
          "relative bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl transition-all duration-300 mx-auto",
          "border border-white/10",
          scrolled && !isExpanded && "bg-white/10"
        )}
        animate={{
          width: isExpanded ? "auto" : "100%",
          height: isExpanded ? "auto" : "56px",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between h-14 px-6"
            >
              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span className={cn(
                  "font-medium transition-all duration-300",
                  scrolled ? "text-sm" : "text-base"
                )}>
                  {scrolled ? "CL" : "Chris Loidolt"}
                </span>
              </button>

              {!scrolled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-white/60">Available</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 min-w-[400px]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Navigation</h2>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        setActiveSection(item.id)
                        setIsExpanded(false)
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        "hover:bg-white/10",
                        activeSection === item.id && "bg-white/10 text-white"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-white/60">Available for work</span>
                  </div>
                  <button className="text-xs text-white/40 hover:text-white/60 transition-colors">
                    Settings
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification dot */}
        <AnimatePresence>
          {!isExpanded && scrolled && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 w-3 h-3 bg-blue-500 rounded-full"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}