"use client"

import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

export function PageLayout({ children, className, fullWidth = false }: PageLayoutProps) {
  if (fullWidth) {
    return <div className={cn("min-h-screen", className)}>{children}</div>
  }

  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      {children}
    </div>
  )
}