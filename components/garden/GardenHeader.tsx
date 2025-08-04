'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface GardenHeaderProps {
  className?: string
  title?: string
  description?: string
}

export function GardenHeader({ className, title, description }: GardenHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: 'Garden', href: '/garden' },
    { name: 'Projects', href: '/seeds/projects' },
    { name: 'Writing', href: '/seeds/writing' },
    { name: 'Tags', href: '/tags' },
    { name: 'About', href: '/about' },
  ]

  if (title || description) {
    return (
      <div className={cn("mb-8", className)}>
        {title && <h1 className="text-4xl font-bold mb-2">{title}</h1>}
        {description && <p className="text-lg text-muted-foreground">{description}</p>}
      </div>
    )
  }

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              Digital Garden
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/search" className="hidden md:flex">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </Link>

            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px]">
                <nav className="flex flex-col gap-4 mt-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}