"use client"

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PriceDisplay } from "@/components/price-display"
import { 
  Search, 
  Filter, 
  Play, 
  Clock, 
  Calendar, 
  TrendingUp,
  Star,
  Users,
  Film,
  Sparkles
} from "lucide-react"
import Link from "next/link"

export default function FilmsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [sortBy, setSortBy] = useState("trending")

  const films = [
    {
      id: 1,
      title: "Quantum Paradox",
      poster: "/futuristic-sci-fi-movie-poster.jpg",
      genre: "Sci-Fi",
      duration: 125,
      releaseDate: "2024-01-15",
      directPurchaseUsdc: 0.012,  // Direct purchase price (higher, no NFT)
      nftPriceUsdc: 0.008,        // NFT ticket price (lower, with resale rights)
      rating: 4.8,
      views: 12400,
      owners: 3200,
      totalSupply: 5000,
      status: "Live",
      trending: true,
      featured: true,
      description: "A mind-bending journey through parallel universes where time itself becomes the ultimate puzzle.",
      director: "Alex Chen",
      cast: ["Sarah Mitchell", "James Park", "Elena Rodriguez"]
    },
    {
      id: 2,
      title: "Neon Dreams",
      poster: "/cyberpunk-action-movie-poster.jpg",
      genre: "Action",
      duration: 132,
      releaseDate: "2024-02-01",
      directPurchaseUsdc: 0.009,
      nftPriceUsdc: 0.006,
      rating: 4.6,
      views: 8900,
      owners: 850,
      totalSupply: 3000,
      status: "Premiering",
      trending: true,
      featured: false,
      description: "In a neon-lit cyberpunk city, a rebel hacker fights against corporate tyranny.",
      director: "Maria Santos",
      cast: ["John Doe", "Lisa Wang", "Marcus Brown"]
    },
    {
      id: 3,
      title: "Ocean's Mystery",
      poster: "/ocean-adventure-movie-poster.jpg",
      genre: "Adventure",
      duration: 118,
      releaseDate: "2024-01-20",
      directPurchaseUsdc: 0.008,
      nftPriceUsdc: 0.005,
      rating: 4.7,
      views: 10200,
      owners: 2500,
      totalSupply: 2500,
      status: "Sold Out",
      trending: false,
      featured: true,
      description: "Deep beneath the waves lies a secret that could change humanity forever.",
      director: "David Kim",
      cast: ["Emma Stone", "Chris Evans", "Zoe Saldana"]
    },
    {
      id: 4,
      title: "The Last Frontier",
      poster: "/space-exploration-movie-poster.jpg",
      genre: "Sci-Fi",
      duration: 145,
      releaseDate: "2024-02-10",
      directPurchaseUsdc: 0.015,
      nftPriceUsdc: 0.010,
      rating: 4.9,
      views: 15600,
      owners: 1800,
      totalSupply: 4000,
      status: "Live",
      trending: true,
      featured: true,
      description: "Humanity's final mission to save Earth from an approaching cosmic threat.",
      director: "Robert Martinez",
      cast: ["Tom Hardy", "Jessica Chastain", "Idris Elba"]
    },
    {
      id: 5,
      title: "Silent Shadows",
      poster: "/thriller-movie-poster.jpg",
      genre: "Thriller",
      duration: 105,
      releaseDate: "2024-01-28",
      directPurchaseUsdc: 0.010,
      nftPriceUsdc: 0.007,
      rating: 4.5,
      views: 7800,
      owners: 1200,
      totalSupply: 2000,
      status: "Live",
      trending: false,
      featured: false,
      description: "A psychological thriller where nothing is as it seems, and trust is a deadly game.",
      director: "Sofia Anderson",
      cast: ["Jake Gyllenhaal", "Emily Blunt", "Oscar Isaac"]
    },
    {
      id: 6,
      title: "Rhythm of the Streets",
      poster: "/music-drama-movie-poster.jpg",
      genre: "Drama",
      duration: 110,
      releaseDate: "2024-02-05",
      directPurchaseUsdc: 0.009,
      nftPriceUsdc: 0.006,
      rating: 4.4,
      views: 6500,
      owners: 980,
      totalSupply: 1500,
      status: "Live",
      trending: false,
      featured: false,
      description: "A young musician's journey from street performer to international sensation.",
      director: "Marcus Johnson",
      cast: ["Zendaya", "Michael B. Jordan", "Lupita Nyong'o"]
    }
  ]

  const genres = ["All", "Sci-Fi", "Action", "Adventure", "Thriller", "Drama", "Comedy", "Horror"]

  const filteredFilms = films.filter(film => {
    const matchesSearch = film.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         film.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === "all" || film.genre === selectedGenre
    return matchesSearch && matchesGenre
  })

  const sortedFilms = [...filteredFilms].sort((a, b) => {
    switch (sortBy) {
      case "trending":
        return b.views - a.views
      case "newest":
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      case "price-low":
        return a.nftPriceUsdc - b.nftPriceUsdc
      case "price-high":
        return b.nftPriceUsdc - a.nftPriceUsdc
      case "rating":
        return b.rating - a.rating
      default:
        return 0
    }
  })

  const featuredFilms = films.filter(f => f.featured)
  const trendingFilms = films.filter(f => f.trending)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Film className="w-8 h-8" />
            Browse Films
          </h1>
          <p className="text-muted-foreground">Discover and purchase NFT tickets to exclusive films</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm py-2 px-4">
            {films.length} Films Available
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search films by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.slice(1).map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Films ({sortedFilms.length})</TabsTrigger>
          <TabsTrigger value="featured">
            <Sparkles className="w-4 h-4 mr-2" />
            Featured ({featuredFilms.length})
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending ({trendingFilms.length})
          </TabsTrigger>
        </TabsList>

        {/* All Films Tab */}
        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFilms.map((film) => (
              <Card key={film.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative">
                  <img 
                    src={film.poster || "/placeholder.svg"} 
                    alt={film.title} 
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {film.featured && (
                      <Badge className="bg-primary/90 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {film.trending && (
                      <Badge className="bg-orange-500/90 backdrop-blur-sm">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={film.status === "Live" ? "default" : film.status === "Sold Out" ? "secondary" : "outline"}
                      className="backdrop-blur-sm"
                    >
                      {film.status}
                    </Badge>
                  </div>

                  {/* Rating */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-semibold text-sm">{film.rating}</span>
                  </div>

                  {/* Quick Play Button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button size="lg" className="rounded-full w-16 h-16">
                      <Play className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg line-clamp-1">{film.title}</h3>
                    <Badge variant="outline">{film.genre}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{film.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Film Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDuration(film.duration)}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(film.releaseDate)}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {film.owners.toLocaleString()} owners
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Play className="w-4 h-4" />
                      {film.views.toLocaleString()} views
                    </div>
                  </div>

                  {/* NFT Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">NFTs Available</span>
                      <span className="font-semibold">
                        {(film.totalSupply - film.owners).toLocaleString()}/{film.totalSupply.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(film.owners / film.totalSupply) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dual Pricing */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    {/* NFT Ticket Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs px-2 py-0">NFT</Badge>
                          NFT Ticket Price
                        </p>
                        <PriceDisplay usdcPrice={film.nftPriceUsdc} size="md" showToggle />
                        <p className="text-xs text-green-600 mt-1">+ Resale Rights</p>
                      </div>
                    </div>

                    {/* Direct Purchase Price */}
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Direct Purchase</p>
                        <PriceDisplay usdcPrice={film.directPurchaseUsdc} size="sm" />
                        <p className="text-xs text-muted-foreground mt-1">Watch only, no resale</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        +{Math.round(((film.directPurchaseUsdc - film.nftPriceUsdc) / film.nftPriceUsdc) * 100)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button asChild className="flex-1" disabled={film.status === "Sold Out"}>
                    <Link href={`/films/${film.id}/nft`}>
                      {film.status === "Sold Out" ? "Sold Out" : "Buy NFT"}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link href={`/films/${film.id}/direct`}>
                      Direct Purchase
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Featured Tab */}
        <TabsContent value="featured" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFilms.map((film) => (
              <Card key={film.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 border-primary/20">
                <div className="relative">
                  <img 
                    src={film.poster || "/placeholder.svg"} 
                    alt={film.title} 
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-primary/90 backdrop-blur-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-semibold text-sm">{film.rating}</span>
                  </div>
                </div>

                <CardHeader>
                  <h3 className="font-bold text-lg">{film.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{film.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{film.genre}</Badge>
                    <span className="text-sm text-muted-foreground">{formatDuration(film.duration)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs px-2 py-0">NFT</Badge>
                        NFT Ticket
                      </p>
                      <PriceDisplay usdcPrice={film.nftPriceUsdc} size="md" showToggle />
                    </div>
                    <div className="pt-2 border-t border-dashed">
                      <p className="text-xs text-muted-foreground mb-1">Direct Purchase</p>
                      <PriceDisplay usdcPrice={film.directPurchaseUsdc} size="sm" />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/films/${film.id}/nft`}>Buy NFT</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/films/${film.id}/direct`}>Direct</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingFilms.map((film) => (
              <Card key={film.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 border-orange-500/20">
                <div className="relative">
                  <img 
                    src={film.poster || "/placeholder.svg"} 
                    alt={film.title} 
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-orange-500/90 backdrop-blur-sm">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-semibold text-sm">{film.rating}</span>
                  </div>
                </div>

                <CardHeader>
                  <h3 className="font-bold text-lg">{film.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{film.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Play className="w-4 h-4" />
                      {film.views.toLocaleString()} views
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {film.owners.toLocaleString()} owners
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs px-2 py-0">NFT</Badge>
                        NFT Ticket
                      </p>
                      <PriceDisplay usdcPrice={film.nftPriceUsdc} size="md" showToggle />
                    </div>
                    <div className="pt-2 border-t border-dashed">
                      <p className="text-xs text-muted-foreground mb-1">Direct Purchase</p>
                      <PriceDisplay usdcPrice={film.directPurchaseUsdc} size="sm" />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/films/${film.id}/nft`}>Buy NFT</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/films/${film.id}/direct`}>Direct</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {sortedFilms.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No films found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for
            </p>
            <Button onClick={() => { setSearchQuery(""); setSelectedGenre("all"); }}>
              Clear Filters
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
