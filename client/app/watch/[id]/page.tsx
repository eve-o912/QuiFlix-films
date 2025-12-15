"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { VideoPlayer } from "@/components/video-player"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock film data - in real app this would come from API based on ID and access token
const getFilmData = (id: string) => {
  const films = {
    "1": {
      id: "1",
      title: "Quantum Horizons",
      year: 2024,
      genre: "Sci-Fi",
      rating: 8.9,
      duration: "2h 18m",
      price: "0.05 ETH",
      poster: "/futuristic-sci-fi-movie-poster.jpg",
      videoSrc: "/placeholder-video.mp4", // In real app, this would be a secure streaming URL
      description:
        "In the year 2087, Dr. Elena Vasquez discovers a way to traverse parallel dimensions through quantum manipulation.",
      director: "Marcus Chen",
      cast: ["Sarah Mitchell", "David Rodriguez", "Kenji Nakamura", "Zara Al-Rashid"],
      tags: ["Sci-Fi", "Thriller", "Action", "Mind-bending"],
      owned: true,
      nftDetails: {
        contract: "0x1234...5678",
        tokenId: "42",
      },
    },
    "2": {
      id: "2",
      title: "The Last Symphony",
      year: 2024,
      genre: "Drama",
      rating: 9.2,
      duration: "2h 5m",
      price: "0.03 ETH",
      poster: "/dramatic-music-movie-poster.jpg",
      videoSrc: "/placeholder-video.mp4",
      description: "A maestro's final performance that changes everything",
      director: "Elena Rodriguez",
      cast: ["Marcus Thompson", "Sofia Chen", "David Kim"],
      tags: ["Drama", "Music", "Emotional"],
      owned: true,
      nftDetails: {
        contract: "0x5678...9012",
        tokenId: "24",
      },
    },
  }

  return films[id as keyof typeof films] || films["1"]
}

export default function WatchPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { token?: string }
}) {
  const [filmData, setFilmData] = useState<any>(null)
  const [accessVerified, setAccessVerified] = useState(false)

  useEffect(() => {
    // In real app, verify access token and load film data
    const token = searchParams.token
    console.log("[v0] Verifying access for film:", params.id, "with token:", token)

    // Simulate access verification
    setTimeout(() => {
      const film = getFilmData(params.id)
      setFilmData(film)
      setAccessVerified(true)
      console.log("[v0] Access verified, loading film:", film.title)
    }, 1000)
  }, [params.id, searchParams.token])

  if (!accessVerified || !filmData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 py-8">
        {/* Back Navigation */}
        <div className="flex items-center mb-6">
          <Link href="/films">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
        </div>

        {/* Video Player */}
        <div className="mb-8">
          <VideoPlayer
            src={filmData.videoSrc}
            title={filmData.title}
            watermark={filmData.owned ? `NFT #${filmData.nftDetails.tokenId}` : "QuiFlix"}
          />
        </div>

        {/* Film Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {filmData.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="bg-primary/20 text-primary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{filmData.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <span>{filmData.year}</span>
                <span>•</span>
                <span>{filmData.genre}</span>
                <span>•</span>
                <span>{filmData.duration}</span>
                <span>•</span>
                <span>⭐ {filmData.rating}</span>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">{filmData.description}</p>
            </div>

            {/* Cast & Crew */}
            <div>
              <h2 className="text-xl font-bold mb-3">Cast & Crew</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Director: </span>
                  <span className="text-muted-foreground">{filmData.director}</span>
                </div>
                <div>
                  <span className="font-semibold">Cast: </span>
                  <span className="text-muted-foreground">{filmData.cast.join(", ")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ownership Status */}

          </div>
        </div>
      </div>
    </div>
  )
}
