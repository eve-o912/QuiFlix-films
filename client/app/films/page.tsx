"use client"

import { useState, useEffect } from "react"
import { CheckoutModal } from "@/components/checkout-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PriceDisplay } from "@/components/price-display"
import { Search, Grid, List, Play, Clock, Star, Users, TrendingUp, Sparkles } from "lucide-react"
import { db } from "@/firebase/firebase"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { useAuth } from "@/hooks/useAuth"

// Film interface
interface Film {
  id: string
  title: string
  year?: number
  genre: string
  rating?: number
  directPurchasePrice: number  // Price in USDC for direct purchase
  nftPrice: number             // Price in USDC for NFT ticket
  poster: string
  owned: boolean
  description: string
  creatorId?: string
  status?: string
  duration?: number
  views?: number
  owners?: number
  totalSupply?: number
  trending?: boolean
  featured?: boolean
}

const genres = ["All", "Sci-Fi", "Drama", "Action", "Thriller", "Adventure", "Mystery", "Horror"]
const sortOptions = [
  { value: "rating", label: "Rating" },
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "title", label: "Title" },
]

export default function FilmsPage() {
  const { currentUser } = useAuth()
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [sortBy, setSortBy] = useState("trending")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
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

  // Fetch films from Firestore
  useEffect(() => {
    const fetchFilms = async () => {
      try {
        // Only fetch approved films
        const q = query(
          collection(db, 'films'),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc')
        )
        const querySnapshot = await getDocs(q)
        const filmsData: Film[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          
          // Calculate prices: NFT is 25% cheaper than direct
          const basePrice = Number.parseFloat(data.price) || 0.008
          const nftPrice = basePrice
          const directPrice = basePrice * 1.25
          
          filmsData.push({
            id: doc.id,
            title: data.title,
            year: data.releaseDate ? new Date(data.releaseDate).getFullYear() : undefined,
            genre: data.genre,
            rating: data.rating || 4.5, // Default rating
            directPurchasePrice: directPrice,
            nftPrice: nftPrice,
            poster: data.posterUrl || data.thumbnailUrl || "/placeholder.svg",
            owned: false, // TODO: Check if user owns this NFT
            description: data.description,
            creatorId: data.creatorId,
            status: data.status,
            duration: data.duration,
            views: Math.floor(Math.random() * 15000) + 1000, // Placeholder
            owners: Math.floor(Math.random() * 3000) + 100, // Placeholder
            totalSupply: 5000,
            trending: Math.random() > 0.5,
            featured: Math.random() > 0.6,
          })
        })

        setFilms(filmsData)
      } catch (error) {
        console.error('Error fetching films:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilms()
  }, [])

  const filteredFilms = films
    .filter((film: Film) => {
      const matchesSearch =
        film.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        film.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        film.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGenre = selectedGenre === "All" || film.genre === selectedGenre
      return matchesSearch && matchesGenre
    })
    .sort((a: Film, b: Film) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "trending":
          return (b.views || 0) - (a.views || 0)
        case "newest":
          return (b.year || 0) - (a.year || 0)
        case "price-low":
          return a.nftPrice - b.nftPrice
        case "price-high":
          return b.nftPrice - a.nftPrice
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const handleBuyNFT = (film: Film, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("[NFT] Purchase initiated for:", film.title)
    setCheckoutModal({
      isOpen: true,
      filmTitle: film.title,
      price: film.nftPrice,
      filmId: film.id,
      purchaseType: "nft",
    })
  }

  const handleBuyDirect = (film: Film, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("[Direct] Purchase initiated for:", film.title)
    setCheckoutModal({
      isOpen: true,
      filmTitle: film.title,
      price: film.directPurchasePrice,
      filmId: film.id,
      purchaseType: "direct",
    })
  }

  const handlePlay = (film: Film) => {
    console.log("[Play] Playing film:", film.title)
    window.location.href = `/watch/${film.id}`
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Browse Films</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Discover premium films - Buy NFT tickets or Direct access
          </p>
        </div>

        {/* Search Bar - Centered */}
        <div className="py-4 sm:py-6 md:py-8 mb-4 sm:mb-6 flex justify-center">
          <div className="relative w-full max-w-2xl px-2 sm:px-0">
            <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
            <Input
              placeholder="Search films, genres, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 py-2 sm:py-3 rounded-3xl text-center placeholder:text-center border-2 focus:border-primary text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-end">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center justify-center lg:justify-end">
              {/* Genre Filter */}
              <div className="flex gap-2 flex-wrap justify-center">
                {genres.map((genre) => (
                  <Badge
                    key={genre}
                    variant={selectedGenre === genre ? "default" : "outline"}
                    className={`cursor-pointer transition-colors text-xs px-3 py-1 ${
                      selectedGenre === genre ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-muted-foreground text-center sm:text-left">
              {filteredFilms.length} film{filteredFilms.length !== 1 ? "s" : ""} found
            </p>
            {(searchQuery || selectedGenre !== "All") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedGenre("All")
                }}
                className="text-xs"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold mb-2">Loading films...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the latest content</p>
          </div>
        )}

        {/* Films Grid */}
        {!loading && viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFilms.map((film) => (
              <div 
                key={film.id} 
                className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={film.poster || "/placeholder.svg"}
                    alt={film.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {film.featured && (
                      <Badge className="bg-primary/90 backdrop-blur-sm text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {film.trending && (
                      <Badge className="bg-orange-500/90 backdrop-blur-sm text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>

                  {/* Owned Badge */}
                  {film.owned && (
                    <Badge className="absolute top-3 right-3 bg-green-500 text-xs">Owned</Badge>
                  )}

                  {/* Rating */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-semibold text-sm">{film.rating}</span>
                  </div>

                  {/* Play Button Overlay */}
                  {film.owned && (
                    <div 
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                      onClick={() => handlePlay(film)}
                    >
                      <Button size="lg" className="rounded-full w-16 h-16">
                        <Play className="w-6 h-6" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg line-clamp-1">{film.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                      <Badge variant="outline">{film.genre}</Badge>
                      {film.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(film.duration)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  {!film.owned && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {film.owners?.toLocaleString()}
                      </span>
                      <span>{film.views?.toLocaleString()} views</span>
                    </div>
                  )}

                  {/* Pricing */}
                  {!film.owned && (
                    <div className="space-y-2 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs px-2 py-0">NFT</Badge>
                          With Resale Rights
                        </p>
                        <PriceDisplay usdcPrice={film.nftPrice} size="sm" showToggle />
                      </div>
                      <div className="border-t border-dashed pt-2">
                        <p className="text-xs text-muted-foreground mb-1">Direct Purchase</p>
                        <PriceDisplay usdcPrice={film.directPurchasePrice} size="sm" />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!film.owned ? (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => handleBuyNFT(film, e)}
                      >
                        Buy NFT
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => handleBuyDirect(film, e)}
                      >
                        Direct
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handlePlay(film)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          // List View
          <div className="space-y-3 sm:space-y-4">
            {filteredFilms.map((film) => (
              <div 
                key={film.id} 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="relative">
                  <img
                    src={film.poster || "/placeholder.svg"}
                    alt={film.title}
                    className="w-full sm:w-32 md:w-40 h-48 sm:h-40 object-cover rounded mx-auto sm:mx-0"
                  />
                  {film.owned && (
                    <Badge className="absolute top-2 right-2 bg-green-500 text-xs">Owned</Badge>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{film.title}</h3>
                        {film.featured && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {film.trending && (
                          <Badge variant="secondary" className="text-xs bg-orange-500/20">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <Badge variant="outline">{film.genre}</Badge>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {film.rating}
                        </span>
                        {film.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(film.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{film.description}</p>

                  {!film.owned && (
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">NFT Ticket</p>
                          <PriceDisplay usdcPrice={film.nftPrice} size="sm" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Direct Purchase</p>
                          <PriceDisplay usdcPrice={film.directPurchasePrice} size="sm" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={(e) => handleBuyNFT(film, e)}>
                          Buy NFT
                        </Button>
                        <Button size="sm" variant="outline" onClick={(e) => handleBuyDirect(film, e)}>
                          Buy Direct
                        </Button>
                      </div>
                    </div>
                  )}

                  {film.owned && (
                    <Button onClick={() => handlePlay(film)}>
                      <Play className="w-4 h-4 mr-2" />
                      Watch Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredFilms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold mb-2">No films found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedGenre("All")
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
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
