"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  User, 
  Film, 
  Gift, 
  Menu,
  Home,
  Upload,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react"

const sidebarLinks = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Films",
    href: "/films",
    icon: Film,
  },
  {
    title: "My Account",
    href: "/account",
    icon: User,
  },
  {
    title: "Claim Films",
    href: "/claim",
    icon: Gift,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Upload",
    href: "/upload",
    icon: Upload,
  },
]

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  isMobile?: boolean
}

export function Sidebar({ className, isCollapsed = false, onToggleCollapse, isMobile = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn(
      "h-full bg-black text-white transition-all duration-300 ease-in-out",
      isCollapsed && !isMobile ? "w-16" : "w-64",
      className
    )}>
      <div className="flex flex-col h-full py-4">
        {/* Header with toggle button */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-6">
            
            {!isMobile && onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0 hover:bg-gray-800 text-white"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                </span>
              </Button>
            )}
          </div>
          
          {/* Navigation Links */}
          <div className="space-y-4">
            {sidebarLinks.map((link) => {
              const IconComponent = link.icon
              const isActive = pathname === link.href
              
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full transition-all duration-200 text-white border-none",
                      isCollapsed && !isMobile ? "justify-center px-2" : "justify-start px-4",
                      isActive && "bg-primary hover:bg-primary/90 font-medium text-white",
                      "hover:bg-gray-800 hover:text-white"
                    )}
                    title={isCollapsed && !isMobile ? link.title : undefined}
                  >
                    <IconComponent className={cn(
                      "h-4 w-4",
                      !isCollapsed || isMobile ? "mr-3" : ""
                    )} />
                    {(!isCollapsed || isMobile) && (
                      <span className="truncate">{link.title}</span>
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface MobileSidebarProps {
  children?: React.ReactNode
}

export function MobileSidebar({ children }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-64 bg-black border-gray-800">
        <div className="flex items-center justify-between mb-4 pr-4">
          <h2 className="text-lg font-semibold text-white">QuiFlix</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-8 w-8 p-0 hover:bg-gray-800 text-white"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <Sidebar isMobile={true} />
      </SheetContent>
    </Sheet>
  )
}

// Desktop Sidebar with collapse functionality
interface DesktopSidebarProps {
  className?: string
}

export function DesktopSidebar({ className }: DesktopSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className={cn(
      "hidden md:flex h-screen",
      className
    )}>
      <div className={cn(
        "border-r border-gray-800 bg-black transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          isMobile={false}
        />
      </div>
    </div>
  )
}