"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Wallet, 
  Film, 
  TrendingUp, 
  Gift, 
  Plus,
  Eye,
  Star,
  Clock,
  Users,
  Coins,
  Trophy,
  PlayCircle,
  ShoppingCart
} from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { OnboardingTutorial } from "@/components/onboarding-tutorial"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock user data - in real app this would come from API
const mockUserData = {
  id: "1",
  username: "MovieLover2024",
  email: "user@example.com",
  walletAddress: "0x1234567890123456789012345678901234567890",
  fiatBalance: 0,
  tokenBalance: 0,
  nftCollection: [],
  joinDate: "2024-10-02",
  watchTime: 0,
  level: 1,
  xp: 0
}

const quickActions = [
  {
    title: "Browse Films",
    description: "Discover amazing content",
    icon: <Film className="h-6 w-6" />,
    href: "/films",
    color: "bg-blue-500"
  },
  {
    title: "Add Funds",
    description: "Top up your wallet",
    icon: <Plus className="h-6 w-6" />,
    href: "/account?tab=wallet",
    color: "bg-green-500"
  },
  {
    title: "Watch & Earn",
    description: "Start earning rewards",
    icon: <PlayCircle className="h-6 w-6" />,
    href: "/films",
    color: "bg-purple-500"
  },
  {
    title: "Claim NFTs",
    description: "Convert purchases to NFTs",
    icon: <Gift className="h-6 w-6" />,
    href: "/claim",
    color: "bg-orange-500"
  }
]

const trendingFilms = [
  {
    id: "1",
    title: "Quantum Horizons",
    genre: "Sci-Fi",
    price: "25 USDT",
    rating: 8.9,
    poster: "/futuristic-sci-fi-movie-poster.jpg",
    isNew: true
  },
  {
    id: "2", 
    title: "The Last Symphony",
    genre: "Drama",
    price: "20 USDT",
    rating: 9.2,
    poster: "/dramatic-music-movie-poster.jpg",
    isHot: true
  },
  {
    id: "3",
    title: "Ocean's Mystery",
    genre: "Adventure", 
    price: "30 USDT",
    rating: 8.7,
    poster: "/ocean-adventure-movie-poster.jpg",
    isTrending: true
  }
]

export default function DashboardPage() {
  const [showTutorial, setShowTutorial] = useState(false)
  const { currentUser, userLoggedIn, loading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !userLoggedIn) {
      router.push('/')
    }
  }, [userLoggedIn, loading, router])

  useEffect(() => {
    // Check if user just signed up (from sessionStorage)
    const justSignedUp = sessionStorage.getItem('just-signed-up')
    const tutorialCompleted = localStorage.getItem('quiflix-tutorial-completed')
    
    if (justSignedUp && !tutorialCompleted) {
      setShowTutorial(true)
      sessionStorage.removeItem('just-signed-up')
    }
  }, [])

  const progressToNextLevel = 0 // Will implement XP system later

  // Show loading while checking authentication
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Don't render if not authenticated (will be redirected)
  if (!userLoggedIn || !currentUser) {
    return null
  }

  return (
    <>
      <PageLayout>
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              Welcome to QuiFlix, {currentUser.displayName || 'Movie Lover'}! 🎬
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your Web3 entertainment journey starts here. Own your favorite films as NFTs and earn rewards for watching.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Wallet className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold">KES 0</div>
                <p className="text-sm text-muted-foreground">Fiat Balance</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Film className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-sm text-muted-foreground">NFTs Owned</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">0h</div>
                <p className="text-sm text-muted-foreground">Watch Time</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold">Level 1</div>
                <p className="text-sm text-muted-foreground">Cinephile Level</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Empty NFT Collection Message */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Film className="h-5 w-5" />
                    Your NFT Collection
                  </CardTitle>
                  <CardDescription>
                    Films you own as NFTs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {true ? ( // Always show empty state for now
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎬</div>
                      <h3 className="text-xl font-semibold mb-2">Your collection is empty</h3>
                      <p className="text-muted-foreground mb-6">
                        Purchase your first film NFT to start building your digital cinema collection
                      </p>
                      <Link href="/films">
                        <Button className="bg-primary hover:bg-primary/90">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Browse Films
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* NFT cards would go here */}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trending Films */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trending Now
                  </CardTitle>
                  <CardDescription>
                    Popular films in the QuiFlix community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {trendingFilms.map((film) => (
                      <Link key={film.id} href={`/films/${film.id}`}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <div className="relative">
                            <img
                              src={film.poster}
                              alt={film.title}
                              className="w-full h-40 object-cover rounded-t-lg"
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                              {film.isNew && (
                                <Badge className="bg-green-500">NEW</Badge>
                              )}
                              {film.isHot && (
                                <Badge className="bg-red-500">HOT</Badge>
                              )}
                              {film.isTrending && (
                                <Badge className="bg-blue-500">TRENDING</Badge>
                              )}
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-semibold truncate">{film.title}</h4>
                            <p className="text-sm text-muted-foreground">{film.genre}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-medium">{film.price}</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm">{film.rating}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>
                    Get started with QuiFlix
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${action.color} text-white`}>
                            {action.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{action.title}</h4>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Level 1</span>
                      <span>0 XP</span>
                    </div>
                    <Progress value={0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      1000 XP to next level
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Films Watched</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Watch Time</span>
                      <span className="font-medium">0h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">NFTs Owned</span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tutorial Button */}
              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-medium mb-2">Need Help?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Watch our quick tutorial to learn the basics
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowTutorial(true)}
                    className="w-full"
                  >
                    View Tutorial
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageLayout>

      {/* Onboarding Tutorial */}
      <OnboardingTutorial 
        open={showTutorial}
        onOpenChange={setShowTutorial}
        userEmail={currentUser.email || undefined}
        walletAddress={currentUser.uid}
      />
    </>
  )
}