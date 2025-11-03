"use client" 

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Play, Mail, Wallet, Copy, ExternalLink } from "lucide-react"

interface CheckoutSuccessProps {
  orderData: {
    orderId: string
    filmTitle: string
    price: string
    email: string
    paymentMethod: string
    claimNFT: boolean
    accessToken: string
    claimVoucher?: string | null
  }
  onWatchNow: () => void
  onClaimNFT?: () => void
}

export function CheckoutSuccess({ orderData, onWatchNow, onClaimNFT }: CheckoutSuccessProps) {
  const [copied, setCopied] = useState(false)

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderData.orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-900">Payment Successful!</h2>
          <p className="text-muted-foreground">Your purchase has been completed</p>
        </div>
      </div>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">{orderData.filmTitle}</span>
            <Badge className="bg-green-100 text-green-800">Purchased</Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{orderData.orderId}</span>
                <Button variant="ghost" size="sm" onClick={copyOrderId} className="h-6 w-6 p-0">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-semibold">{orderData.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="capitalize">{orderData.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{orderData.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-4">
        {/* Watch Now */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Ready to Watch</h3>
                <p className="text-sm text-muted-foreground">Start streaming {orderData.filmTitle} now</p>
              </div>
              <Button onClick={onWatchNow} className="bg-primary hover:bg-primary/90">
                <Play className="mr-2 h-4 w-4" />
                Watch Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* NFT Claim */}
        {orderData.claimNFT && orderData.claimVoucher && (
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Claim Your NFT Ticket</h3>
                    <p className="text-sm text-muted-foreground">Connect a wallet to mint your NFT ticket</p>
                  </div>
                  <Button onClick={onClaimNFT} variant="outline" className="border-purple-300 bg-transparent">
                    <Wallet className="mr-2 h-4 w-4" />
                    Claim NFT
                  </Button>
                </div>
                <div className="p-3 bg-white rounded border">
                  <p className="text-xs text-muted-foreground mb-1">Claim Voucher</p>
                  <p className="font-mono text-sm break-all">{orderData.claimVoucher}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Confirmation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Confirmation Email Sent</h3>
                <p className="text-sm text-muted-foreground">
                  Check your inbox at {orderData.email} for your receipt and access details
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="flex-1 bg-transparent">
          <ExternalLink className="mr-2 h-4 w-4" />
          View in Account
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          Browse More Films
        </Button>
      </div>

      {/* Support */}
      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Need help? Contact our{" "}
          <a href="/support" className="text-primary hover:underline">
            support team
          </a>
        </p>
      </div>
    </div>
  )
}
