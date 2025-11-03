"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Film, DollarSign, Eye, Users } from "lucide-react"

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

interface AdminAnalyticsProps {
  data: AdminAnalyticsData
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function AdminAnalytics({ data }: AdminAnalyticsProps) {
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    films: {
      label: "Films",
      color: "hsl(var(--chart-2))",
    },
    transactions: {
      label: "Transactions",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Genre */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue by Genre
            </CardTitle>
            <CardDescription>
              Distribution of revenue across different film genres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.revenueByGenre}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ genre, percent }) => `${genre} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {data.charts.revenueByGenre.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Films Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Films Uploaded (Last 30 Days)
            </CardTitle>
            <CardDescription>
              Daily film upload trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.filmsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-films)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Transactions Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Transaction Volume (Last 30 Days)
            </CardTitle>
            <CardDescription>
              Daily transaction trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.transactionsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-transactions)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Performing Films */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Top Performing Films
            </CardTitle>
            <CardDescription>
              Films ranked by total revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topFilms.slice(0, 5).map((film, index) => (
                <div key={film.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{film.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {film.purchases} purchases • {film.totalViews} views
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{film.totalRevenue} USDT</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Latest NFT purchases on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.purchases.slice(0, 10).map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{purchase.filmTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      Buyer: {purchase.buyerId.slice(0, 6)}...{purchase.buyerId.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{purchase.price} USDT</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
