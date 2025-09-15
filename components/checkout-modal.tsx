"use client"

import { useState } from "react"
import { Wallet, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckoutSuccess } from "@/components/checkout-success"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  filmTitle: string
  price: string
  filmId: string
  purchaseType?: "nft" | "direct"
}

type CheckoutStep = "payment-method" | "stablecoin-selection" | "wallet" | "success"

export function CheckoutModal({ isOpen, onClose, filmTitle, price, filmId, purchaseType = "nft" }: CheckoutModalProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("payment-method")
  const [selectedStablecoin, setSelectedStablecoin] = useState<"usdt" | "usdc" | null>(null)
  const [orderData, setOrderData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleClose = () => {
    setCurrentStep("payment-method")
    setSelectedStablecoin(null)
    setOrderData(null)
    setIsProcessing(false)
    onClose()
  }

  const handlePaymentMethodSelect = (method: "wallet") => {
    console.log("[v0] Payment method selected:", method, "for purchase type:", purchaseType)
    setCurrentStep("stablecoin-selection")
  }

  const handleStablecoinSelect = (coin: "usdt" | "usdc") => {
    console.log("[v0] Stablecoin selected:", coin)
    setSelectedStablecoin(coin)
    setCurrentStep("wallet")
  }

  const handleWalletPayment = async () => {
    console.log("[v0] Processing", selectedStablecoin?.toUpperCase(), "payment for:", filmTitle)
    setIsProcessing(true)
    try {
      // Simulate wallet connection and stablecoin payment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const walletOrderData = {
        orderId: `${selectedStablecoin?.toUpperCase()}_${Date.now()}`,
        filmTitle,
        price,
        email: "wallet@user.eth", // Would come from wallet
        paymentMethod: selectedStablecoin,
        purchaseType,
        claimNFT: purchaseType === "nft",
        status: "completed",
        accessToken: `ACCESS_${Date.now()}`,
        claimVoucher: purchaseType === "direct" ? `VOUCHER_${Date.now()}` : null,
      }

      console.log("[v0] Stablecoin payment completed:", walletOrderData)
      setOrderData(walletOrderData)
      setCurrentStep("success")
    } catch (error) {
      console.error("[v0] Stablecoin payment failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWatchNow = () => {
    console.log("[v0] Redirecting to player with access token:", orderData?.accessToken)
    window.location.href = `/watch/${filmId}?token=${orderData?.accessToken}`
    handleClose()
  }

  const handleClaimNFT = () => {
    console.log("[v0] Opening claim NFT flow for voucher:", orderData?.claimVoucher)
    window.location.href = `/claim?voucher=${orderData?.claimVoucher}`
    handleClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStep === "payment-method" && (
              <div>
                <h3 className="text-lg font-semibold">Buy ticket — {filmTitle}</h3>
                <p className="text-sm text-muted-foreground">Pay with stablecoins (USDT/USDC)</p>
              </div>
            )}
            {currentStep === "stablecoin-selection" && "Choose Stablecoin"}
            {currentStep === "wallet" && "Connect Wallet"}
            {currentStep === "success" && "Purchase Complete"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary - Show on all steps except success */}
          {currentStep !== "success" && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">{filmTitle}</span>
              <span className="font-bold text-primary">{price}</span>
            </div>
          )}

          {/* Payment Method Selection */}
          {currentStep === "payment-method" && (
            <div className="space-y-3">
              <h4 className="font-medium">Payment Method</h4>

              <Card
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handlePaymentMethodSelect("wallet")}
              >
                <CardContent className="flex items-center p-4">
                  <Wallet className="h-5 w-5 mr-3 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium">Crypto Wallet (Stablecoins Only)</div>
                    <div className="text-sm text-muted-foreground">
                      Pay with USDT or USDC - stable, reliable payments
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stablecoin Selection */}
          {currentStep === "stablecoin-selection" && (
            <div className="space-y-3">
              <Button onClick={() => setCurrentStep("payment-method")} variant="ghost" size="sm" className="mb-2">
                ← Back to payment method
              </Button>

              <h4 className="font-medium">Select Stablecoin</h4>

              <Card
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleStablecoinSelect("usdt")}
              >
                <CardContent className="flex items-center p-4">
                  <DollarSign className="h-5 w-5 mr-3 text-green-500" />
                  <div className="flex-1">
                    <div className="font-medium">USDT (Tether)</div>
                    <div className="text-sm text-muted-foreground">Most widely used stablecoin, 1:1 USD backed</div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleStablecoinSelect("usdc")}
              >
                <CardContent className="flex items-center p-4">
                  <DollarSign className="h-5 w-5 mr-3 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium">USDC (USD Coin)</div>
                    <div className="text-sm text-muted-foreground">
                      Regulated stablecoin by Coinbase, fully backed by USD
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Wallet Payment */}
          {currentStep === "wallet" && selectedStablecoin && (
            <div className="space-y-4">
              <Button onClick={() => setCurrentStep("stablecoin-selection")} variant="ghost" size="sm" className="mb-2">
                ← Back to stablecoin selection
              </Button>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Connect Your Wallet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your wallet to pay with {selectedStablecoin.toUpperCase()} and{" "}
                  {purchaseType === "nft" ? "own this NFT ticket instantly" : "get streaming access"}.
                </p>
                <div className="flex items-center gap-2 mb-4 p-3 bg-background rounded border">
                  <DollarSign
                    className={`h-4 w-4 ${selectedStablecoin === "usdt" ? "text-green-500" : "text-blue-500"}`}
                  />
                  <span className="text-sm font-medium">
                    Paying with {selectedStablecoin.toUpperCase()} • {price}
                  </span>
                </div>
                <Button
                  onClick={handleWalletPayment}
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isProcessing ? "Processing..." : `Connect Wallet & Pay with ${selectedStablecoin.toUpperCase()}`}
                </Button>
              </div>
            </div>
          )}

          {/* Success */}
          {currentStep === "success" && orderData && (
            <CheckoutSuccess orderData={orderData} onWatchNow={handleWatchNow} onClaimNFT={handleClaimNFT} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
