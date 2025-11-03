"use client"

import { useState, useEffect } from "react"
import { ClaimWidget } from "@/components/claim-widget"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import Link from "next/link"

export default function ClaimPage({ searchParams }: { searchParams: { voucher?: string } }) {
  const [voucherData, setVoucherData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [claimStatus, setClaimStatus] = useState<"pending" | "success" | "error">("pending")

  useEffect(() => {
    const voucher = searchParams.voucher
    console.log("[v0] Loading claim page with voucher:", voucher)

    // Simulate voucher verification
    setTimeout(() => {
      if (voucher) {
        // Mock voucher data
        setVoucherData({
          voucherId: voucher,
          filmTitle: "Quantum Horizons",
          filmId: "1",
          poster: "/futuristic-sci-fi-movie-poster.jpg",
          purchaseDate: "2024-03-15",
          price: "0.05 ETH",
          status: "ready_to_claim",
          nftDetails: {
            contract: "0x1234...5678",
            tokenId: "42",
          },
        })
      }
      setIsLoading(false)
    }, 1000)
  }, [searchParams.voucher])

  const handleClaimSuccess = (nftData: any) => {
    console.log("[v0] NFT claimed successfully:", nftData)
    setClaimStatus("success")
  }

  const handleClaimError = (error: any) => {
    console.error("[v0] NFT claim failed:", error)
    setClaimStatus("error")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
     
        <div className="container px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading claim details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!voucherData) {
    return (
      <div className="min-h-screen bg-background">
     
        <div className="container px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Invalid Claim Link</h1>
            <p className="text-muted-foreground mb-6">
              This claim link is invalid or has expired. Please check your email for the correct link.
            </p>
            <Link href="/account">
              <Button>Go to Account</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (claimStatus === "success") {
    return (
      <div className="min-h-screen bg-background">
    
        <div className="container px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">NFT Claimed Successfully!</h1>
            <p className="text-muted-foreground mb-6">
              Your NFT ticket for "{voucherData.filmTitle}" has been minted to your wallet.
            </p>
            <div className="space-y-3">
              <Link href={`/watch/${voucherData.filmId}`}>
                <Button className="w-full">Watch Now</Button>
              </Link>
              <Link href="/account">
                <Button variant="outline" className="w-full bg-transparent">
                  View in Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageLayout className="py-8">
        <div className="flex gap-2 mb-6">
          <Link href="/account">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Account
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Claim Your NFT</h1>
            <p className="text-muted-foreground">Convert your purchase into an NFT ticket that you truly own</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Film Info */}
            <Card>
              <CardContent className="p-6">
                <img
                  src={voucherData.poster || "/placeholder.svg"}
                  alt={voucherData.filmTitle}
                  className="w-full rounded-lg mb-4"
                />
                <h3 className="font-bold text-lg mb-2">{voucherData.filmTitle}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purchase Date</span>
                    <span>{voucherData.purchaseDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Paid</span>
                    <span>{voucherData.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className="bg-green-100 text-green-800">Ready to Claim</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Claim Widget */}
            <div>
              <ClaimWidget
                id={voucherData.voucherId}
                filmTitle={voucherData.filmTitle}
                onSuccess={handleClaimSuccess}
                onError={handleClaimError}
              />
            </div>
          </div>

          {/* Benefits */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">Why Claim Your NFT?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-1">True Ownership</h4>
                  <p className="text-sm text-muted-foreground">Own your ticket forever on the blockchain</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-1">Trade & Sell</h4>
                  <p className="text-sm text-muted-foreground">Transfer or sell your ticket to others</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-1">Exclusive Access</h4>
                  <p className="text-sm text-muted-foreground">Special perks and future benefits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </PageLayout>
  )
}
