"use client"

import { useState } from "react"
import { CheckoutModal } from "@/components/checkout-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PriceDisplay } from "@/components/price-display"
import { Play, Star, Clock, Calendar, Wallet, Share, Heart, ArrowLeft, Users, TrendingUp, ShoppingBag, Sparkles } from "lucide-react"
import Link from "next/link"

// Mock film data - in real app this would come from API
const filmData = {
  id: "1",
  title: "Quantum Horizons",
  year: 2024,
  genre: "Sci-Fi",
  rating: 8.9,
  duration: "2h 18m",
  nftPrice: 0.008,           // NFT ticket price in USDC
  directPurchasePrice: 0.012, // Direct purchase price in USDC (25% more)
  poster: "/futuristic-sci-fi-movie-poster.jpg",
  backdrop: "/cinematic-movie-theater-with-neon-lights.jpg",
  owned: false,
  description:
    "In the year 2087, Dr. Elena Vasquez discovers a way to traverse parallel dimensions through quantum manipulation. As she explores alternate realities, she uncovers a conspiracy that threatens the very fabric of existence across all dimensions. With time running out, she must navigate through infinite possibilities to save not just her world, but all worlds.",
  director: "Marcus Chen",
  cast: ["Sarah Mitchell", "David Rodriguez", "Kenji Nakamura", "Zara Al-Rashid"],
  tags: ["Sci-Fi", "Thriller", "Action", "Mind-bending"],
  trailer: "/placeholder-video.mp4",
  releaseDate: "March 15, 2024",
  language: "English",
  subtitles: ["English", "Spanish", "French", "Japanese"],
  views: 12450,
  trending: true,
  featured: true,
  nftDetails: {
    contract: "0x1234...5678",
    tokenId: "42",
    royalty: "10%",
    totalSupply: "5000",
    currentOwners: "3847",
    blockchain: "Lisk,Base",
    standard: "ERC-721",
  },
  benefits: {
    nft: [
      "Own a unique digital collectible",
      "Resell on secondary markets",
      "Earn from future resales (10% royalty)",
      "Exclusive NFT holder perks",
      "Access to special content",
    ],
    direct: [
      "Instant access to watch",
      "No blockchain required",
      "Pay with card or crypto",
      "Stream anywhere, anytime",
    ],
  },
}

export default function FilmDetailPage({ params }: { params: { slug: string } }) {
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean
    filmTitle: string
    price: number
    filmId: string
    purchaseType: "nft" | "direct"
  }>({
    isOpen: false,
    filmTitle: "",
    price: 0,
    filmId: "",
    purchaseType: "nft",
  })
  const [isLiked, setIsLiked] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)

  const handleBuyNFT = () => {
    console.log("[NFT] Purchase initiated for:", filmData.title)
    setCheckoutModal({
      isOpen: true,
      filmTitle: filmData.title,
      price: filmData.nftPrice,
      filmId: filmData.id,
      purchaseType: "nft",
    })
  }

  const handleBuyDirect = () => {
    console.log("[Direct] Purchase initiated for:", filmData.title)
    setCheckoutModal({
      isOpen: true,
      filmTitle: filmData.title,
      price: filmData.directPurchasePrice,
      filmId: filmData.id,
      purchaseType: "direct",
    })
  }

  const handlePlay = () => {
    console.log("[Play] Playing film:", filmData.title)
    window.location.href = `/watch/${filmData.id}`
  }

  const handleShare = () => {
    console.log("[Share] Sharing film:", filmData.title)
    if (navigator.share) {
      navigator.share({
        title: filmData.title,
        text: filmData.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const savingsPercentage = Math.round(((filmData.directPurchasePrice - filmData.nftPrice) / filmData.directPurchasePrice) * 100)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={filmData.backdrop || "/placeholder.svg"}
            alt={filmData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        </div>

        <div className="relative z-10 container px-4 h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            {/* Poster */}
            <div className="flex-shrink-0 relative">
              <img
                src={filmData.poster || "/placeholder.svg"}
                alt={filmData.title}
                className="w-48 md:w-64 rounded-lg shadow-2xl"
              />
              {filmData.featured && (
                <Badge className="absolute -top-2 -right-2 bg-primary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>

            {/* Film Info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {filmData.trending && (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  {filmData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-primary/20 text-primary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white">{filmData.title}</h1>
                <div className="flex items-center gap-4 text-white/80">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {filmData.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {filmData.year}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {filmData.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {filmData.views.toLocaleString()} views
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!filmData.owned ? (
                  <>
                    <Button onClick={handleBuyNFT} size="lg" className="bg-primary hover:bg-primary/90">
                      <Wallet className="mr-2 h-5 w-5" />
                      Buy NFT Ticket
                    </Button>
                    <Button onClick={handleBuyDirect} size="lg" variant="secondary">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Buy Direct Access
                    </Button>
                  </>
                ) : (
                  <Button onClick={handlePlay} size="lg" className="bg-primary hover:bg-primary/90">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Now
                  </Button>
                )}
                <Button
                  onClick={() => setShowTrailer(true)}
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Trailer
                </Button>
                <Button
                  onClick={() => setIsLiked(!isLiked)}
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button
                  onClick={handleShare}
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-8">
        <div className="flex gap-2 mb-6">
          <Link href="/films">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Films
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{filmData.description}</p>
            </div>

            {/* Pricing Comparison */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Purchase Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NFT Ticket Card */}
                <Card className="border-2 border-primary relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-semibold">
                    SAVE {savingsPercentage}%
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-primary">
                        <Wallet className="w-3 h-3 mr-1" />
                        NFT TICKET
                      </Badge>
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </div>
                    <div className="mb-4">
                      <PriceDisplay usdcPrice={filmData.nftPrice} size="lg" showToggle />
                      <p className="text-xs text-green-600 mt-1">Best value - includes resale rights</p>
                    </div>
                    <Separator className="my-4" />
                    <ul className="space-y-2 mb-4">
                      {filmData.benefits.nft.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <Button onClick={handleBuyNFT} className="w-full">
                      Buy NFT Ticket
                    </Button>
                  </CardContent>
                </Card>

                {/* Direct Purchase Card */}
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        DIRECT ACCESS
                      </Badge>
                    </div>
                    <div className="mb-4">
                      <PriceDisplay usdcPrice={filmData.directPurchasePrice} size="lg" showToggle />
                      <p className="text-xs text-muted-foreground mt-1">Watch only, no NFT ownership</p>
                    </div>
                    <Separator className="my-4" />
                    <ul className="space-y-2 mb-4">
                      {filmData.benefits.direct.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500 mt-0.5">✓</span>
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <Button onClick={handleBuyDirect} variant="outline" className="w-full">
                      Buy Direct Access
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Savings Callout */}
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-600 font-medium">
                  💡 Save <PriceDisplay usdcPrice={filmData.directPurchasePrice - filmData.nftPrice} className="inline font-bold" /> ({savingsPercentage}%) by choosing the NFT ticket! Plus, you can resell it later and earn royalties.
                </p>
              </div>
            </div>

            {/* Cast & Crew */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Cast & Crew</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Director</h3>
                  <p className="text-muted-foreground">{filmData.director}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cast</h3>
                  <div className="flex flex-wrap gap-2">
                    {filmData.cast.map((actor) => (
                      <Badge key={actor} variant="outline">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* NFT Details */}
            <div>
              <h2 className="text-2xl font-bold mb-4">NFT Details</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Contract Address</h4>
                      <p className="text-sm text-muted-foreground font-mono">{filmData.nftDetails.contract}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Token Standard</h4>
                      <p className="text-sm text-muted-foreground">{filmData.nftDetails.standard}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Creator Royalty</h4>
                      <p className="text-sm text-muted-foreground">{filmData.nftDetails.royalty}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Total Supply</h4>
                      <p className="text-sm text-muted-foreground">{filmData.nftDetails.totalSupply}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Current Owners</h4>
                      <p className="text-sm text-muted-foreground">{filmData.nftDetails.currentOwners}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Blockchain</h4>
                      <p className="text-sm text-muted-foreground">{filmData.nftDetails.blockchain}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Purchase */}
            {!filmData.owned && (
              <Card className="border-2 border-primary">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Quick Purchase
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">NFT Ticket (Recommended)</p>
                      <PriceDisplay usdcPrice={filmData.nftPrice} size="md" showToggle />
                    </div>
                    <Button onClick={handleBuyNFT} className="w-full bg-primary hover:bg-primary/90">
                      <Wallet className="mr-2 h-4 w-4" />
                      Buy NFT Ticket
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">or</span>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Direct Access</p>
                      <PriceDisplay usdcPrice={filmData.directPurchasePrice} size="md" showToggle />
                    </div>
                    <Button onClick={handleBuyDirect} variant="outline" className="w-full">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Buy Direct
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Owned Badge */}
            {filmData.owned && (
              <Card className="border-2 border-green-500">
                <CardContent className="p-6">
                  <Badge className="w-full justify-center bg-green-500 text-white mb-4 py-2">
                    ✓ You own this film
                  </Badge>
                  <Button onClick={handlePlay} className="w-full bg-primary hover:bg-primary/90">
                    <Play className="mr-2 h-4 w-4" />
                    Watch Now
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Film Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Film Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Release Date</span>
                    <span className="font-medium">{filmData.releaseDate}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Genre</span>
                    <span className="font-medium">{filmData.genre}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{filmData.duration}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium">{filmData.language}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Views</span>
                    <span className="font-medium">{filmData.views.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground">Subtitles</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filmData.subtitles.map((sub) => (
                        <Badge key={sub} variant="outline" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Share</h3>
                <Button onClick={handleShare} variant="outline" className="w-full">
                  <Share className="mr-2 h-4 w-4" />
                  Share Film
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ ...checkoutModal, isOpen: false })}
        filmTitle={checkoutModal.filmTitle}
        price={checkoutModal.price.toString()}
        filmId={checkoutModal.filmId}
        purchaseType={checkoutModal.purchaseType}
      />
    </div>
  )
}
