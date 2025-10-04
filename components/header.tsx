"use client"

import { Search, User, LogOut, Copy, Check, Film, Settings, Upload } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { SignupModal } from "@/components/signup-modal"
import { MobileSidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function Header() {
  const { currentUser, userLoggedIn, logOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)
  const [signupModalOpen, setSignupModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if we're on the films page
  const isOnFilmsPage = pathname === '/films'
  // Check if we're on the main page (landing page)
  const isMainPage = pathname === '/'
  // Show sidebar only if user is logged in OR not on main page
  const showSidebar = userLoggedIn || !isMainPage

  const copyEmail = async () => {
    if (currentUser?.email) {
      await navigator.clipboard.writeText(currentUser.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  const handleLogout = async () => {
    await logOut()
  }

  // Debug function to test if click is working
  const handleIconClick = () => {
    console.log('Profile icon clicked!')
  }

  const handleUploadClick = () => {
    router.push('/upload')
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Image
              src="/quiflixlogo.png"
              alt="QuiFlix Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold text-xl">QuiFlix</span>
          </div>
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search films..." className="pl-10 bg-muted/50" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-8 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Mobile Sidebar + Logo */}
        <div className="flex items-center space-x-2">
          {showSidebar && (
            <MobileSidebar>
              <div />
            </MobileSidebar>
          )}
          <Image
            src="/quiflixlogo.png"
            alt="QuiFlix Logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="font-bold text-xl hidden sm:inline">QuiFlix</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Upload Film Button - Only show on films page when logged in */}
          {userLoggedIn && isOnFilmsPage && (
            <Button 
              onClick={handleUploadClick}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              size="sm"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Film</span>
            </Button>
          )}

          {!userLoggedIn ? (
            <>
              <Button onClick={() => setSignupModalOpen(true)} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Sign In / Sign Up
              </Button>
              <SignupModal
                open={signupModalOpen}
                onOpenChange={setSignupModalOpen}
                onSuccess={() => router.push('/dashboard')}
              />
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger 
                className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent transition-colors outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={handleIconClick}
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <User className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 z-[9999] bg-background border shadow-lg"
                sideOffset={5}
              >
                <div className="px-2 py-1.5 text-sm text-muted-foreground border-b">
                  Signed in as {currentUser?.email}
                </div>
                <DropdownMenuItem 
                  onClick={copyEmail} 
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="flex-1 font-mono text-sm">{currentUser?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleProfileClick} 
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Film className="h-4 w-4" />
                  My NFTs
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleUploadClick}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  Upload Film
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
