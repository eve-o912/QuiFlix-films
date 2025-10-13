"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { FilmCard } from "@/components/film-card"
import { CheckoutModal } from "@/components/checkout-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Grid, List } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

// Film interface
interface Film {
  id: string
  title: string
  year?: number
  genre: string
  rating?: number
  price: string
  poster: string
  owned: boolean
  description: string
  creatorId?: string
  status?: string
}

const genres = ["All", "Sci-Fi", "Drama", "Action", "Thriller", "Adventure", "Mystery", "Horror"]
const sortOptions = [
  { value: "rating", label: "Rating" },
  { value: "year", label: "Year" },
  { value: "price", label: "Price" },
  { value: "title", label: "Title" },
]

export default function FilmsPage() {
  const { currentUser } = useAuth()
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [sortBy, setSortBy] = useState("rating")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean
    filmTitle: string
    price: string
    filmId: string
    purchaseType: "nft" | "direct"
  }>({
    isOpen: false,
    filmTitle: "",
    price: "",
    filmId: "",
    purchaseType: "nft",
  })

  // Fetch films from backend API
  useEffect(() => {
    const fetchFilms = async () => {
      try {
        // Fetch films from backend API
        const response = await fetch('http://localhost:3001/api/films', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch films')
        }

        const data = await response.json()
        const filmsData: Film[] = []

        if (data.success && data.films) {
          data.films.forEach((film: any) => {
            filmsData.push({
              id: film.id.toString(),
              title: film.title,
              year: film.releaseDate ? new Date(film.releaseDate).getFullYear() : undefined,
              genre: film.genre,
              rating: 8.5, // Default rating, could be calculated from reviews
              price: `${film.price} ETH`,
              poster: film.thumbnailUrl || "/placeholder.svg",
              owned: false, // TODO: Check if user owns this NFT
              description: film.description,
              creatorId: film.producerId?.toString(),
              status: film.isActive ? 'approved' : 'pending',
            })
          })
        }

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
        film.genre.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGenre = selectedGenre === "All" || film.genre === selectedGenre
      return matchesSearch && matchesGenre
    })
    .sort((a: Film, b: Film) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "year":
          return (b.year || 0) - (a.year || 0)
        case "price":
          return Number.parseFloat(a.price) - Number.parseFloat(b.price)
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const handleBuyNFT = (film: Film) => {
    console.log("[v0] NFT purchase initiated for:", film.title)
    setCheckoutModal({
      isOpen: true,
      filmTitle: film.title,
      price: film.price,
      filmId: film.id,
      purchaseType: "nft",
    })
  }

  const handleBuyDirect = (film: Film) => {
    console.log("[v0] Direct purchase initiated for:", film.title)
    setCheckoutModal({
      isOpen: true,
      filmTitle: film.title,
      price: film.price,
      filmId: film.id,
      purchaseType: "direct",
    })
  }

  const handlePlay = (film: Film) => {
    console.log("[v0] Playing film:", film.title)
    // TODO: Navigate to video player with film ID
    window.location.href = `/watch/${film.id}`
  }

  return (
    <div className="min-h-screen bg-background">
     

      <div className="container px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Browse Films</h1>
          <p className="text-muted-foreground text-lg">Discover premium films and own your viewing experience</p>
        </div>

        {/* Search Bar - Centered */}
        <div className="py-8 mb-6 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search films, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-3xl text-center placeholder:text-center border-2 focus:border-primary"
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
                <SelectTrigger className="w-32">
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

        {/* Films Grid/List */}
        {!loading && viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFilms.map((film) => (
              <div 
                key={film.id} 
                className="group cursor-pointer bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                onClick={() => film.owned ? handlePlay(film) : handleBuyNFT(film)}
              >
                <div className="aspect-[3/2] overflow-hidden">
                  <img
                    src={film.poster || "/placeholder.svg"}
                    alt={film.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg leading-tight truncate flex-1 mr-2">{film.title}</h3>
                    {film.owned && <Badge className="bg-primary text-xs flex-shrink-0">Owned</Badge>}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{film.genre}</span>
                    <span className="flex items-center gap-1">
                      ⭐ {film.rating}
                    </span>
                  </div>
                  {!film.owned && (
                    <div className="pt-1">
                      <span className="text-primary font-medium">{film.price}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="space-y-3 sm:space-y-4">
            {filteredFilms.map((film) => (
              <div 
                key={film.id} 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => film.owned ? handlePlay(film) : handleBuyNFT(film)}
              >
                <img
                  src={film.poster || "/placeholder.svg"}
                  alt={film.title}
                  className="w-full sm:w-20 md:w-24 h-32 sm:h-24 md:h-28 object-cover rounded mx-auto sm:mx-0"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-base sm:text-lg">{film.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {film.genre} • ⭐ {film.rating}
                      </p>
                      {!film.owned && (
                        <p className="text-primary font-medium text-sm mt-1">{film.price}</p>
                      )}
                    </div>
                    {film.owned && <Badge className="bg-primary self-center sm:self-start">Owned</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredFilms.length === 0 && (
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
        price={checkoutModal.price}
        filmId={checkoutModal.filmId}
        purchaseType={checkoutModal.purchaseType}
      />
    </div>
  )
}
