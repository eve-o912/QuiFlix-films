import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, DollarSign, TrendingUp, Eye, Loader2, Plus } from "lucide-react";
import { useMyFilms, useMyPurchases, useMyInvestments, useMyEarnings } from "@/hooks/useFilms";
import { useNavigate } from "react-router-dom";

const MyFilms = () => {
  const navigate = useNavigate();
  const { data: myFilms, isLoading: loadingFilms } = useMyFilms();
  const { data: myPurchases, isLoading: loadingPurchases } = useMyPurchases();
  const { data: myInvestments, isLoading: loadingInvestments } = useMyInvestments();
  const { data: myEarnings, isLoading: loadingEarnings } = useMyEarnings();

  const totalEarnings = myEarnings?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const totalInvested = myInvestments?.reduce((sum, i: any) => sum + Number(i.amount_invested), 0) || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="ml-16 pt-16">
        <div className="px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground">My Films</h1>
                <p className="text-muted-foreground">Manage your films, investments, and earnings</p>
              </div>
              <Button onClick={() => navigate('/submit')} className="gap-2">
                <Plus className="h-4 w-4" />
                Submit New Film
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="mb-8 grid gap-4 md:grid-cols-4">
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/20 p-3">
                      <Film className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">My Films</p>
                      <p className="text-2xl font-bold text-foreground">{myFilms?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-green-500/20 p-3">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold text-foreground">${totalEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-500/20 p-3">
                      <TrendingUp className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Invested</p>
                      <p className="text-2xl font-bold text-foreground">${totalInvested.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-purple-500/20 p-3">
                      <Eye className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purchases</p>
                      <p className="text-2xl font-bold text-foreground">{myPurchases?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="created" className="space-y-6">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="created">My Created Films</TabsTrigger>
                <TabsTrigger value="purchased">Purchased</TabsTrigger>
                <TabsTrigger value="investments">Investments</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
              </TabsList>

              {/* Created Films */}
              <TabsContent value="created">
                {loadingFilms ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : myFilms && myFilms.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {myFilms.map((film) => (
                      <Card key={film.id} className="border-border bg-card">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{film.title}</CardTitle>
                            <Badge className={getStatusColor(film.status)}>{film.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Views</span>
                              <span className="text-foreground">{film.views.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Earnings</span>
                              <span className="text-primary font-medium">${Number(film.total_earnings).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shares Sold</span>
                              <span className="text-foreground">
                                {film.total_shares - film.available_shares} / {film.total_shares}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-border bg-card">
                    <CardContent className="py-12 text-center">
                      <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">You haven't created any films yet</p>
                      <Button className="mt-4" onClick={() => navigate('/submit')}>
                        Submit Your First Film
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Purchased Films */}
              <TabsContent value="purchased">
                {loadingPurchases ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : myPurchases && myPurchases.length > 0 ? (
                  <div className="space-y-4">
                    {myPurchases.map((purchase: any) => (
                      <Card key={purchase.id} className="border-border bg-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{purchase.film?.title || 'Unknown Film'}</h3>
                              <p className="text-sm text-muted-foreground">
                                {purchase.purchase_type === 'nft' ? 'NFT Ownership' : 'Direct Access'} • {purchase.network}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">${Number(purchase.amount).toFixed(2)} USDC</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(purchase.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-border bg-card">
                    <CardContent className="py-12 text-center">
                      <Eye className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">You haven't purchased any films yet</p>
                      <Button className="mt-4" onClick={() => navigate('/browse')}>
                        Browse Films
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Investments */}
              <TabsContent value="investments">
                {loadingInvestments ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : myInvestments && myInvestments.length > 0 ? (
                  <div className="space-y-4">
                    {myInvestments.map((investment: any) => (
                      <Card key={investment.id} className="border-border bg-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{investment.film?.title || 'Unknown Film'}</h3>
                              <p className="text-sm text-muted-foreground">
                                {investment.shares_owned} shares • Earning {(investment.shares_owned * 0.2).toFixed(2)}% of revenue
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">${Number(investment.amount_invested).toFixed(2)}</p>
                              <p className="text-xs text-green-400">
                                +${Number(investment.earnings_claimed).toFixed(2)} claimed
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-border bg-card">
                    <CardContent className="py-12 text-center">
                      <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">You haven't invested in any films yet</p>
                      <Button className="mt-4" onClick={() => navigate('/browse')}>
                        Find Films to Invest
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Earnings */}
              <TabsContent value="earnings">
                {loadingEarnings ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : myEarnings && myEarnings.length > 0 ? (
                  <div className="space-y-4">
                    {myEarnings.map((earning: any) => (
                      <Card key={earning.id} className="border-border bg-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{earning.film?.title || 'Unknown Film'}</h3>
                              <p className="text-sm text-muted-foreground capitalize">
                                {earning.source.replace('_', ' ')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-400">+${Number(earning.amount).toFixed(2)}</p>
                              <Badge variant={earning.claimed ? "secondary" : "default"}>
                                {earning.claimed ? 'Claimed' : 'Available'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-border bg-card">
                    <CardContent className="py-12 text-center">
                      <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No earnings yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Submit a film or invest to start earning
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyFilms;
