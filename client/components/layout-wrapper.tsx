"use client"

import { useWeb3 } from "@/hooks/useWeb3"
import { DesktopSidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isConnected } = useWeb3()
  const pathname = usePathname()
  
  // Check if we're on the main page (landing page)
  const isMainPage = pathname === '/'
  
  // Show sidebar only if:
  // 1. User is connected to wallet, OR
  // 2. Not on the main page (other pages can show sidebar regardless)
  const showSidebar = isConnected || !isMainPage

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar - conditionally rendered */}
      {showSidebar && <DesktopSidebar />}

      {/* Main Content */}
      <main className={`flex-1 bg-background ${showSidebar ? '' : 'w-full'} px-2 sm:px-4 md:px-6`}>
        {children}
      </main>
    </div>
  )
}