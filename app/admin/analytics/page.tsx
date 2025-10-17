"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart3,
    TrendingUp,
    Film,
    Users,
    DollarSign,
    Eye,
    Shield,
    AlertTriangle,
    Trash2,
    RefreshCw
} from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { AdminAnalytics } from "@/components/admin-analytics"
import { AdminFilmTable } from "@/components/admin-film-table"

interface AdminAnalyticsData {
    overview: {
        totalFilms: number
        activeFilms: number
        totalNFTsMinted: number
        totalTransactions: number
        totalRevenue: string
        totalViews: number
    }
    charts: {
        revenueByGenre: Array<{ genre: string; revenue: string }>
        filmsOverTime: Array<{ date: string; count: number }>
        transactionsOverTime: Array<{ date: string; count: number }>
    }
    topFilms: Array<{
        id: string
        title: string
        totalRevenue: string
        totalViews: number
        purchases: number
    }>
    recentActivity: {
        purchases: Array<{
            id: string
            filmTitle: string
            buyerId: string
            price: string
            createdAt: string
        }>
    }
}

export default function AdminAnalyticsPage() {
    const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { currentUser, userLoggedIn, loading: authLoading } = useAuth()
    const router = useRouter()

    // Check if user is admin
    // const isAdmin = currentUser?.uid && process.env.NEXT_PUBLIC_ADMIN_WALLETS?.split(',').includes(currentUser.uid.toLowerCase())

    // Temporarily bypass admin check to view dashboard during development
    const isAdmin = true

    useEffect(() => {
        if (!authLoading && !userLoggedIn) {
            router.push('/')
            return
        }

        if (!authLoading && userLoggedIn && !isAdmin) {
            router.push('/dashboard')
            return
        }

        if (isAdmin) {
            fetchAnalytics()
        }
    }, [userLoggedIn, authLoading, isAdmin, router])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            setError(null)

            console.log('Fetching analytics from: http://localhost:3001/api/admin/analytics')

            const response = await fetch('http://localhost:3001/api/admin/analytics', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors'
            })

            console.log('Response status:', response.status)
            console.log('Response ok:', response.ok)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Response error:', errorText)
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
            }

            const data = await response.json()
            console.log('Analytics data received:', data)
            setAnalytics(data.analytics)
        } catch (err) {
            console.error('Analytics fetch error:', err)
            setError(err instanceof Error ? err.message : 'Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4" />
                        <p>Loading admin dashboard...</p>
                    </div>
                </div>
            </PageLayout>
        )
    }

    if (!userLoggedIn || !isAdmin) {
        return null
    }

    if (error) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={fetchAnalytics}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    </div>
                </div>
            </PageLayout>
        )
    }

    return (
        <PageLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold">Super Admin Dashboard</h1>
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Comprehensive analytics and management tools for QuiFlix platform
                    </p>
                </div>

                {/* Overview Cards */}
                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Film className="h-8 w-8 text-blue-500" />
                                </div>
                                <div className="text-2xl font-bold">{analytics.overview.totalFilms}</div>
                                <p className="text-sm text-muted-foreground">Total Films</p>
                                <Badge variant="secondary" className="mt-2">
                                    {analytics.overview.activeFilms} Active
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <BarChart3 className="h-8 w-8 text-green-500" />
                                </div>
                                <div className="text-2xl font-bold">{analytics.overview.totalNFTsMinted}</div>
                                <p className="text-sm text-muted-foreground">NFTs Minted</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <DollarSign className="h-8 w-8 text-yellow-500" />
                                </div>
                                <div className="text-2xl font-bold">{analytics.overview.totalRevenue} USDT</div>
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <TrendingUp className="h-8 w-8 text-purple-500" />
                                </div>
                                <div className="text-2xl font-bold">{analytics.overview.totalTransactions}</div>
                                <p className="text-sm text-muted-foreground">Transactions</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Main Content Tabs */}
                <Tabs defaultValue="analytics" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="management" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Film Management
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="analytics" className="space-y-6">
                        {analytics && <AdminAnalytics data={analytics} />}
                    </TabsContent>

                    <TabsContent value="management" className="space-y-6">
                        <AdminFilmTable />
                    </TabsContent>
                </Tabs>
            </div>
        </PageLayout>
    )
}
