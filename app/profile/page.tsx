'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCustodialWallet } from '@/hooks/useCustodialWallet'
import { 
  User, 
  Wallet, 
  Film, 
  Trophy, 
  Copy, 
  Check, 
  ArrowLeft,
  Settings,
  Download
} from 'lucide-react'

export default function ProfilePage() {
  const { address, isConnected, balance, formatAddress: formatWalletAddress } = useCustodialWallet()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if wallet not connected
  useEffect(() => {
    if (mounted && !isConnected) {
      router.push('/films')
    }
  }, [mounted, isConnected, router])

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // formatWalletAddress is already provided by the hook

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
    
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                <p className="text-muted-foreground mb-4">
                  Manage your QuiFlix account and view your digital film collection
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    Connected
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wallet Information */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Wallet Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                        {formatWalletAddress(address!)}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyAddress}
                        className="flex items-center gap-1"
                      >
                        {copied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to copy full address
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Network</label>
                    <p className="text-sm mt-1">Lisk Sepolia Testnet</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Balance</label>
                    <p className="text-sm mt-1">{balance} ETH</p>
                    <p className="text-xs text-muted-foreground">Balance updates automatically</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Film className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Films Owned</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">NFTs Collected</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                  </CardContent>
                </Card>
              </div>

              {/* My Films Section */}
              <Card>
                <CardHeader>
                  <CardTitle>My Film Collection</CardTitle>
                  <CardDescription>
                    Films you own and can watch anytime
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No films yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your collection by purchasing films
                    </p>
                    <Button onClick={() => router.push('/films')}>
                      Browse Films
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                    <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
