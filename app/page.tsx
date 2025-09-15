"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { FilmCard } from "@/components/film-card"
import { CheckoutModal } from "@/components/checkout-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, TrendingUp, Users, Shield } from "lucide-react"

const featuredFilms = [
  {
    id: "1",
    title: "Quantum Horizons",
    year: 2024,
    genre: "Sci-Fi",
    rating: 8.9,
    price: "0.05 ETH",
    poster: "/futuristic-sci-fi-movie-poster.jpg",
    owned: false,
  },
  {
    id: "2",
    title: "The Last Symphony",
    year: 2024,
    genre: "Drama",
    rating: 9.2,
    price: "0.03 ETH",
    poster: "/dramatic-music-movie-poster.jpg",
    owned: true,
  },
  {
    id: "3",
    title: "Digital Rebellion",
    year: 2024,
    genre: "Action",
    rating: 8.7,
    price: "0.04 ETH",
    poster: "/cyberpunk-action-movie-poster.jpg",
    owned: false,
  },
]

const trendingFilms = [
  {
    id: "4",
    title: "Neon Dreams",
    year: 2024,
    genre: "Thriller",
    rating: 8.5,
    price: "0.02 ETH",
    poster: "/neon-noir-thriller-poster.jpg",
    owned: false,
  },
  {
    id: "5",
    title: "Ocean's Edge",
    year: 2024,
    genre: "Adventure",
    rating: 8.8,
    price: "0.03 ETH",
    poster: "/ocean-adventure-movie-poster.jpg",
    owned: false,
  },
  {
    id: "6",
    title: "Mind Palace",
    year: 2024,
    genre: "Mystery",
    rating: 9.0,
    price: "0.04 ETH",
    poster: "/psychological-mystery-movie-poster.jpg",
    owned: false,
  },
]

export default function HomePage() {
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

  const handleBuyNFT = (film: any) => {
    console.log("[v0] NFT purchase initiated for:", film.title)
    setCheckoutModal({
      isOpen: true,
      filmTitle: film.title,
      price: film.price,
      filmId: film.id,
      purchaseType: "nft",
    })
  }

  const handleBuyDirect = (film: any) => {
    console.log("[v0] Direct purchase initiated for:", film.title)
    setCheckoutModal({
      isOpen: true,
      filmTitle: film.title,
      price: film.price,
      filmId: film.id,
      purchaseType: "direct",
    })
  }

  const handlePlay = (film: any) => {
    console.log("[v0] Playing film:", film.title)
    // TODO: Navigate to video player with film ID
    window.location.href = `/watch/${film.id}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        <img
          src="/cinematic-movie-theater-with-neon-lights.jpg"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-20 container px-4 text-center">
          <Badge className="mb-4 bg-primary text-white border-primary">The Future of Cinema</Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            Own Your Movie
            <span className="text-primary block">Experience</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Stream premium films and own NFT tickets. No wallet? No problem. Buy directly and claim your NFT anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Start Watching
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-background/80 backdrop-blur">
              Browse Films
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Films */}
      <section className="py-16 container px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Films</h2>
            <p className="text-muted-foreground">Handpicked premium content</p>
          </div>
          <Button variant="outline">View All</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredFilms.map((film) => (
            <FilmCard
              key={film.id}
              {...film}
              onBuyNFT={() => handleBuyNFT(film)}
              onBuyDirect={() => handleBuyDirect(film)}
              onPlay={() => handlePlay(film)}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
              </div>
              <h3 className="text-3xl font-bold">10K+</h3>
              <p className="text-muted-foreground">NFT Tickets Sold</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Users className="h-8 w-8 text-primary mb-2" />
              </div>
              <h3 className="text-3xl font-bold">5K+</h3>
              <p className="text-muted-foreground">Active Viewers</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary mb-2" />
              </div>
              <h3 className="text-3xl font-bold">100%</h3>
              <p className="text-muted-foreground">Secure Streaming</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="py-16 container px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Trending Now</h2>
            <p className="text-muted-foreground">What everyone's watching</p>
          </div>
          <Button variant="outline">View All</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingFilms.map((film) => (
            <FilmCard
              key={film.id}
              {...film}
              onBuyNFT={() => handleBuyNFT(film)}
              onBuyDirect={() => handleBuyDirect(film)}
              onPlay={() => handlePlay(film)}
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Three simple ways to enjoy premium cinema</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold">Choose Your Film</h3>
              <p className="text-muted-foreground">
                Browse our curated collection of premium films and select what you want to watch.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold">Buy Your Way</h3>
              <p className="text-muted-foreground">
                Pay with crypto for instant NFT ownership, or use card/M-Pesa and claim your NFT later.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold">Watch & Own</h3>
              <p className="text-muted-foreground">
                Stream instantly and own your ticket forever. Trade, collect, or just enjoy the show.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 container px-4">
        <div className="bg-primary/10 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience the Future?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of film lovers who are already collecting and streaming with QuiFlix.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Your Collection
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-16">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">QF</span>
                </div>
                <span className="font-bold text-xl">QuiFlix</span>
              </div>
              <p className="text-muted-foreground">The future of cinema streaming and NFT ownership.</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Platform</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Browse Films
                  </a>
                </div>
                <div>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    How It Works
                  </a>
                </div>
                <div>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Help Center
                  </a>
                </div>
                <div>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Contact Us
                  </a>
                </div>
                <div>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Claim NFT
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </a>
                </div>
                <div>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                </div>
                <div>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Cookie Policy
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 mt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 QuiFlix. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
