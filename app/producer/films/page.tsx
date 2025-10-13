'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useAuth } from '@/hooks/useAuth'

interface Film {
  id: number
  title: string
  poster?: string
  status: string
  price: string
  minted?: number
  total?: number
  views?: number
  avgWatchTime?: string
  revenue?: string
  royalties?: string
}

export default function MyFilmsPage() {
  const { currentUser } = useAuth()
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFilms = async () => {
      if (!currentUser) {
        setFilms([])
        return
      }
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          setError('Authentication token missing. Please connect your wallet.')
          setLoading(false)
          return
        }
        const response = await fetch('/api/films/producer/films', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch films')
        }
        const data = await response.json()
        // Map backend film data to frontend Film interface
        const mappedFilms = data.films.map((film: any) => ({
          id: film.id,
          title: film.title,
          poster: film.thumbnailUrl || '/placeholder.svg',
          status: film.isActive ? 'Live' : 'Pending',
          price: `${film.price} ETH`,
          minted: film.totalPurchases || 0,
          total: film.totalSupply || 5000, // fallback total supply
          views: film.totalViews || 0,
          avgWatchTime: 'N/A', // Not available from backend currently
          revenue: film.totalRevenue ? `$${film.totalRevenue}` : '$0',
          royalties: 'N/A' // Not available from backend currently
        }))
        setFilms(mappedFilms)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch films')
      } finally {
        setLoading(false)
      }
    }
    fetchFilms()
  }, [currentUser])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Films</h1>
          <p className="text-muted-foreground">Manage your uploaded films and track their performance</p>
        </div>
        <Button asChild>
          <Link href="/producer/upload">Upload New Film</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Input placeholder="Search films..." className="max-w-sm" disabled />
            <Select disabled>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="premiering">Premiering</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
            <Select disabled>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="revenue">Highest Revenue</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Films Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && <p>Loading films...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && films.length === 0 && <p>No films uploaded yet.</p>}
        {!loading && !error && films.map((film) => (
          <Card key={film.id} className="overflow-hidden">
            <div className="relative">
              <img src={film.poster || "/placeholder.svg"} alt={film.title} className="w-full h-48 object-cover" />
              <Badge
                className="absolute top-3 right-3"
                variant={film.status === "Live" ? "default" : film.status === "Premiering" ? "secondary" : "outline"}
              >
                {film.status}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{film.title}</CardTitle>
              <p className="text-sm text-muted-foreground">Price: {film.price}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Sales Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>NFTs Sold</span>
                  <span>
                    {film.minted?.toLocaleString()}/{film.total?.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(film.minted! / film.total!) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Views</p>
                  <p className="font-semibold">{film.views?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Watch</p>
                  <p className="font-semibold">{film.avgWatchTime}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Revenue</p>
                  <p className="font-semibold text-green-600">{film.revenue}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Royalties</p>
                  <p className="font-semibold text-primary">{film.royalties}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  Airdrop
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload New Film Card */}
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload New Film</h3>
          <p className="text-muted-foreground text-center mb-4">
            Add a new film to your collection and start selling NFT tickets
          </p>
          <Button asChild>
            <Link href="/producer/upload">Get Started</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
