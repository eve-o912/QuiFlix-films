import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function MyFilmsPage() {
  const mockFilms = [
    {
      id: 1,
      title: "Quantum Paradox",
      poster: "/futuristic-sci-fi-movie-poster.jpg",
      status: "Live",
      price: "$15 / 0.008 ETH",
      minted: 3200,
      total: 5000,
      views: 12400,
      avgWatchTime: "1h 45m",
      revenue: "$48,000",
      royalties: "$2,400",
    },
    {
      id: 2,
      title: "Neon Dreams",
      poster: "/cyberpunk-action-movie-poster.jpg",
      status: "Premiering",
      price: "$12 / 0.006 ETH",
      minted: 850,
      total: 3000,
      views: 2100,
      avgWatchTime: "2h 12m",
      revenue: "$10,200",
      royalties: "$510",
    },
    {
      id: 3,
      title: "Ocean's Mystery",
      poster: "/ocean-adventure-movie-poster.jpg",
      status: "Ended",
      price: "$10 / 0.005 ETH",
      minted: 2500,
      total: 2500,
      views: 8900,
      avgWatchTime: "1h 58m",
      revenue: "$25,000",
      royalties: "$1,250",
    },
  ]

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
            <Input placeholder="Search films..." className="max-w-sm" />
            <Select>
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
            <Select>
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
        {mockFilms.map((film) => (
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
                    {film.minted.toLocaleString()}/{film.total.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(film.minted / film.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Views</p>
                  <p className="font-semibold">{film.views.toLocaleString()}</p>
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
