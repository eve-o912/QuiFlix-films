"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Copy, Wallet, RefreshCw, Plus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useCustodialWallet } from '@/hooks/useCustodialWallet'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'

export function CustodialWalletCard() {
  const { currentUser, userLoggedIn } = useAuth()
  const {
    wallet,
    address,
    balance,
    isLoading,
    error,
    isConnected,
    refreshBalance,
    fundWallet,
    formatAddress,
  } = useCustodialWallet()
  
  const { toast } = useToast()
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`
      })
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy to clipboard"
      })
    }
  }

  const handleFundWallet = async () => {
    const success = await fundWallet('1.0')
    if (success) {
      toast({
        title: "Wallet Funded!",
        description: "Added 1 ETH to your wallet for testing"
      })
    } else {
      toast({
        variant: "destructive",
        title: "Funding Failed",
        description: "Failed to fund wallet"
      })
    }
  }

  const handleRefreshBalance = async () => {
    await refreshBalance()
    toast({
      title: "Balance Updated",
      description: "Wallet balance has been refreshed"
    })
  }

  if (!userLoggedIn || !currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Custodial Wallet
          </CardTitle>
          <CardDescription>
            Please sign in to access your custodial wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A custodial wallet will be automatically created when you sign up
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Custodial Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Custodial Wallet
          </CardTitle>
          <CardDescription>
            Creating your secure wallet...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Custodial Wallet
          <Badge variant="secondary" className="ml-auto">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </CardTitle>
        <CardDescription>
          Your secure wallet tied to {currentUser.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Wallet Address</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(address!, 'Address')}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="font-mono text-sm bg-muted p-2 rounded border">
            {formatAddress(address)}
          </div>
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Balance</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshBalance}
              disabled={isLoading}
              className="h-6 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{balance}</span>
            <span className="text-sm text-muted-foreground">ETH</span>
          </div>
        </div>

        <Separator />

        {/* Private Key Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-orange-600">Private Key</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="h-6 px-2"
            >
              {showPrivateKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
          {showPrivateKey ? (
            <div className="space-y-2">
              <div className="font-mono text-xs bg-orange-50 dark:bg-orange-950 p-2 rounded border border-orange-200 dark:border-orange-800 break-all">
                {wallet.privateKey}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(wallet.privateKey, 'Private Key')}
                  className="text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <Alert variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription>
                  Never share your private key! Anyone with access can control your wallet.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="font-mono text-xs bg-muted p-2 rounded border">
              {'•'.repeat(64)}
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          {process.env.NODE_ENV === 'development' && (
            <Button
              onClick={handleFundWallet}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-1" />
              Fund Wallet
            </Button>
          )}
        </div>

        {/* Information */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This wallet is automatically generated from your email address and stored securely. 
            You can use it to interact with blockchain features without connecting an external wallet.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}