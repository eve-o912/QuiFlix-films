'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye,
  Film,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface AnalyticsData {
  totalRevenue: number
  totalViews: number
  totalUsers: number
  totalFilms: number
  revenueGrowth: number
  viewsGrowth: number
  usersGrowth: number
  filmsGrowth: number
  topFilms: Array<{
    id: string
    title: string
    views: number
    revenue: number
  }>
  recentTransactions: Array<{
    id: string
    filmTitle: string
    amount: number
    date: string
    user: string
  }>
}

export default function AnalyticsPage() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    // Check if user is admin (you can customize this check)
    if (!currentUser) {
      router.push('/films')
      return
    }

    fetchAnalytics()
  }, [currentUser, router])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${await currentUser?.getIdToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalyticsData(data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <p className="text-destructive">{error || 'No data available'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    growth, 
    prefix = '' 
  }: { 
    title: string
    value: number
    icon: any
    growth: number
    prefix?: string
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{value.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          {growth >= 0 ? (
            <ArrowUpRight className="h-3 w-3 text-green-500" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500" />
          )}
          <span className={growth >= 0 ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(growth)}%
          </span>
          from last month
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your platform's performance and insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={analyticsData.totalRevenue}
          icon={DollarSign}
          growth={analyticsData.revenueGrowth}
          prefix="$"
        />
        <StatCard
          title="Total Views"
          value={analyticsData.totalViews}
          icon={Eye}
          growth={analyticsData.viewsGrowth}
        />
        <StatCard
          title="Total Users"
          value={analyticsData.totalUsers}
          icon={Users}
          growth={analyticsData.usersGrowth}
        />
        <StatCard
          title="Total Films"
          value={analyticsData.totalFilms}
          icon={Film}
          growth={analyticsData.filmsGrowth}
        />
      </div>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="films" className="space-y-4">
        <TabsList>
          <TabsTrigger value="films">Top Films</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="films" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Films</CardTitle>
              <CardDescription>
                Films with the highest views and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topFilms?.map((film, index) => (
                  <div 
                    key={film.id} 
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{film.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          {film.views.toLocaleString()} views
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${film.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest film purchases and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentTransactions?.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{transaction.filmTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.user} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
