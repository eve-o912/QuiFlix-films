"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ClaimWidget } from "@/components/claim-widget"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Play, Download, ExternalLink, Receipt, Calendar, Copy, Eye, EyeOff, RefreshCw } from "lucide-react"
import { PriceDisplay } from "@/components/price-display"
import { getPreferredCurrency, setPreferredCurrency, convertUSDCtoKES } from "@/lib/currency"

const ownedNFTs = [
  {
    id: "1",
    title: "The Last Symphony",
    year: 2024,
    genre: "Drama",
    rating: 9.2,
    poster: "/dramatic-music-movie-poster.jpg",
    tokenId: "42",
    contractAddress: "0x1234...5678",
    purchaseDate: "2024-03-15",
    purchasePrice: "0.03 ETH",
    purchasePriceUSDC: 15, // Added for conversion
  },
]

const purchaseHistory = [
  {
    id: "USDT_1710518400000",
    filmTitle: "The Last Symphony",
    price: "15 USDT",
    priceUSDC: 15,
    date: "2024-03-15",
    status: "completed",
    paymentMethod: "usdt",
    hasNFT: true,
    accessToken: "ACCESS_1710518400000",
  },
  {
    id: "USDC_1710432000000",
    filmTitle: "Quantum Horizons",
    price: "25 USDC",
    priceUSDC: 25,
    date: "2024-03-14",
    status: "completed",
    paymentMethod: "usdc",
    hasNFT: false,
    claimVoucher: "VOUCHER_1710432000000",
    accessToken: "ACCESS_1710432000000",
  },
]

const claimableOrders = purchaseHistory.filter((order) => !order.hasNFT && order.claimVoucher)

export default function AccountPage() {
  const [showTokens, setShowTokens] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [displayCurrency, setDisplayCurrency] = useState<'KES' | 'USDC'>(() => getPreferredCurrency())

  // Calculate total spent in selected currency
  const totalSpentUSDC = purchaseHistory.reduce((sum, order) => sum + order.priceUSDC, 0)
  const totalSpentKES = convertUSDCtoKES(totalSpentUSDC)

  const handlePlay = (film: any) => {
    console.log("Playing:", film.title)
  }

  const handleClaim = async (walletAddress: string) => {
    console.log("Claiming NFT to wallet:", walletAddress)
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedToken(type)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const downloadReceipt = (orderId: string) => {
    console.log("Downloading receipt for:", orderId)
  }

  const toggleDisplayCurrency = () => {
    const newCurrency = displayCurrency === 'KES' ? 'USDC' : 'KES'
    setDisplayCurrency(newCurrency)
    setPreferredCurrency(newCurrency)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Account</h1>
              <p className="text-muted-foreground text-lg">Manage your films, NFTs, and purchase history</p>
            </div>
            {/* Global Currency Toggle */}
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
              <span className="text-sm text-muted-foreground">Display Currency:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDisplayCurrency}
                className="h-8 px-3 gap-1"
              >
                <span className="font-semibold">{displayCurrency}</span>
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">{ownedNFTs.length}</div>
              <div className="text-sm text-muted-foreground">NFTs Owned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">{purchaseHistory.length}</div>
              <div className="text-sm text-muted-foreground">Total Purchases</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">{claimableOrders.length}</div>
              <div className="text-sm text-muted-foreground">Claimable NFTs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <PriceDisplay 
                amount={totalSpentUSDC} 
                currency="USDC" 
                showToggle={false}
                size="lg"
                className="justify-center"
              />
              <div className="text-sm text-muted-foreground mt-1">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="nfts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="nfts">My NFTs</TabsTrigger>
            <TabsTrigger value="claim">Claim NFTs</TabsTrigger>
            <TabsTrigger value="orders">Purchase History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* My NFTs Tab */}
          <TabsContent value="nfts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My NFT Collection</h2>
              <Badge variant="outline">
                {ownedNFTs.length} NFT{ownedNFTs.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {ownedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedNFTs.map((nft) => (
                  <Card key={nft.id} className="overflow-hidden">
                    <div className="relative aspect-[2/3]">
                      <img
                        src={nft.poster || "/placeholder.svg"}
                        alt={nft.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-primary">Owned</Badge>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{nft.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {nft.year} • {nft.genre} • ⭐ {nft.rating}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Token ID</span>
                          <span className="font-mono">#{nft.tokenId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Purchase Price</span>
                          <PriceDisplay 
                            amount={nft.purchasePriceUSDC} 
                            currency="USDC" 
                            showToggle={false}
                            size="sm"
                          />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Purchase Date</span>
                          <span>{nft.purchaseDate}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => handlePlay(nft)} className="flex-1 bg-primary hover:bg-primary/90">
                          <Play className="mr-2 h-4 w-4" />
                          Watch
                        </Button>
                        <Button variant="outline" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <h3 className="text-xl font-semibold mb-2">No NFTs Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Purchase films with crypto or claim your existing vouchers to start your collection
                  </p>
                  <Button>Browse Films</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Claim NFTs Tab */}
          <TabsContent value="claim" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Claim Your NFTs</h2>
              <Badge variant="outline">{claimableOrders.length} Available</Badge>
            </div>

            {claimableOrders.length > 0 ? (
              <div className="space-y-4">
                {claimableOrders.map((order) => (
                  <ClaimWidget key={order.id} orderId={order.id} filmTitle={order.filmTitle} onClaim={handleClaim} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold mb-2">All Caught Up</h3>
                  <p className="text-muted-foreground">You don't have any NFTs to claim right now</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Purchase History Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Purchase History</h2>
              <Badge variant="outline">
                {purchaseHistory.length} Order{purchaseHistory.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="space-y-4">
              {purchaseHistory.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{order.filmTitle}</h3>
                          <Badge
                            variant={order.status === "completed" ? "default" : "secondary"}
                            className={order.status === "completed" ? "bg-green-100 text-green-800" : ""}
                          >
                            {order.status}
                          </Badge>
                          {order.hasNFT && <Badge className="bg-purple-100 text-purple-800">NFT Owned</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {order.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Receipt className="h-4 w-4" />
                            {order.paymentMethod === "usdt"
                              ? "USDT"
                              : order.paymentMethod === "usdc"
                                ? "USDC"
                                : order.paymentMethod}
                          </span>
                          <PriceDisplay 
                            amount={order.priceUSDC} 
                            currency="USDC" 
                            showToggle={false}
                            size="sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Order ID:</span>
                          <span className="font-mono text-sm">{order.id}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(order.id, order.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {copiedToken === order.id && <span className="text-xs text-green-600">Copied!</span>}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" onClick={() => downloadReceipt(order.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Receipt
                        </Button>
                        {order.accessToken && (
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            <Play className="mr-2 h-4 w-4" />
                            Watch
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Access Token (for debugging/support) */}
                    {order.accessToken && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Access Token</span>
                          <Button variant="ghost" size="sm" onClick={() => setShowTokens(!showTokens)}>
                            {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {showTokens && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs font-mono break-all">
                            {order.accessToken}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Account Settings</h2>

            <div className="space-y-6">
              {/* Currency Preference */}
              <Card>
                <CardHeader>
                  <CardTitle>Currency Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Display Currency</p>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred currency for displaying prices
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={displayCurrency === 'KES' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setDisplayCurrency('KES')
                          setPreferredCurrency('KES')
                        }}
                      >
                        KES
                      </Button>
                      <Button
                        variant={displayCurrency === 'USDC' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setDisplayCurrency('USDC')
                          setPreferredCurrency('USDC')
                        }}
                      >
                        USDC
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    Current exchange rate: 1 USDC ≈ KES 129.50
                  </div>
                </CardContent>
              </Card>

              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Email Address</label>
                      <p className="text-muted-foreground">user@example.com</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Wallet Address</label>
                      <p className="text-muted-foreground font-mono">0x1234...5678</p>
                    </div>
                  </div>
                  <Button variant="outline">Edit Profile</Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates about your purchases</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">NFT Claim Reminders</p>
                        <p className="text-sm text-muted-foreground">Get reminded to claim your NFTs</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Connected Wallets</p>
                        <p className="text-sm text-muted-foreground">Manage your connected wallets</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
