import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ProducerDashboard() {
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
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Producer Dashboard</h1>
        <p className="text-muted-foreground">Manage your films, track earnings, and analyze your audience</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Films</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">2</div>
            <p className="text-xs text-muted-foreground mt-1">Currently streaming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$12,450</div>
            <p className="text-xs text-green-600 mt-1">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Royalties Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$3,200</div>
            <p className="text-xs text-muted-foreground mt-1">From resales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Viewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">5,400</div>
            <p className="text-xs text-muted-foreground mt-1">Unique wallets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resale Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">850</div>
            <p className="text-xs text-muted-foreground mt-1">NFT resales</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Films Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Films</CardTitle>
            <Button variant="outline" size="sm">
              <a href="/producer/films">View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockFilms.map((film) => (
              <div key={film.id} className="flex gap-4 p-4 border border-border rounded-lg">
                <img
                  src={film.poster || "/placeholder.svg"}
                  alt={film.title}
                  className="w-20 h-28 object-cover rounded-md"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{film.title}</h3>
                    <Badge variant={film.status === "Live" ? "default" : "secondary"}>{film.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Price: {film.price}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      Sold: {film.minted.toLocaleString()}/{film.total.toLocaleString()}
                    </span>
                    <span>Views: {film.views.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Watch: {film.avgWatchTime}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button>Upload New Film</Button>
            <Button variant="outline">Airdrop Promo NFTs</Button>
            <Button variant="outline">View Analytics</Button>
            <Button variant="outline">Withdraw Earnings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
