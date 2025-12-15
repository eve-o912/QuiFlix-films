"use client"

import { useState } from "react"
import { Wallet, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ClaimWidgetProps {
  orderId: string
  filmTitle: string
  onClaim?: (walletAddress: string) => Promise<void>
}

export function ClaimWidget({ orderId, filmTitle, onClaim }: ClaimWidgetProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setWalletAddress("0x1234567890abcdef1234567890abcdef12345678")
    } catch (err) {
      setError("Failed to connect wallet. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleClaim = async () => {
    if (!walletAddress || !onClaim) return

    setIsClaiming(true)
    setError(null)

    try {
      await onClaim(walletAddress)
      setClaimed(true)
    } catch (err) {
      setError("Failed to claim NFT. Please try again.")
    } finally {
      setIsClaiming(false)
    }
  }

  if (claimed) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">NFT Claimed Successfully!</h3>
              <p className="text-sm text-green-700">Your {filmTitle} NFT ticket is now in your wallet.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-primary" />
          <span>Claim Your NFT Ticket</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-1">{filmTitle}</h4>
          <p className="text-sm text-muted-foreground">Order #{orderId}</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!walletAddress ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to claim your NFT ticket. Network fees may apply.
            </p>
            <Button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-primary">Wallet Connected</p>
              <p className="text-xs text-muted-foreground font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>
            <Button onClick={handleClaim} disabled={isClaiming} className="w-full bg-primary hover:bg-primary/90">
              {isClaiming ? "Claiming NFT..." : "Claim NFT Ticket"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">This will mint the NFT to your connected wallet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
