"use client"

import { Search, User, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useWallet } from "@/hooks/use-wallet"
import { useRouter } from "next/navigation"

export function Header() {
  const { isConnected, disconnectWallet } = useWallet()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="QuiFlix Logo" className="h-8 w-8 rounded" />
          <span className="font-bold text-xl">QuiFlix</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search films..." className="pl-10 bg-muted/50" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected && (
              <Button 
                onClick={() => router.push('/upload')} 
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="mr-2 h-4 w-4" />
                Submit Film
              </Button>
            )}
            <WalletConnectButton />
            {isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>My Account</DropdownMenuItem>
                  <DropdownMenuItem>My NFTs</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={disconnectWallet}>Disconnect</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
