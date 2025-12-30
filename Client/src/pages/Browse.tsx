import React from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { FilmCard } from "@/components/FilmCard";
import { Footer } from "@/components/Footer";
import { Play, TrendingUp, Clock, Star, Loader2 } from "lucide-react";
import { useFilms } from "@/hooks/useFilms";

// Sample films for when database is empty
const sampleFilms = [
  {
    id: "sample-1",
    title: "Neon Dreams",
    poster_url: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&h=450&fit=crop",
    views: 125000,
    rating: 4.8,
    direct_price: 5.99,
    nft_price: 9.99,
    investment_price_per_share: 2.5,
    available_shares: 65,
    total_shares: 100,
  },
  {
    id: "sample-2",
    title: "Ocean's Edge",
    poster_url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=450&fit=crop",
    views: 98000,
    rating: 4.6,
    direct_price: 4.99,
    nft_price: 7.99,
    investment_price_per_share: 1.5,
    available_shares: 80,
    total_shares: 100,
  },
  {
    id: "sample-3",
    title: "Mind Palace",
    poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop",
    views: 156000,
    rating: 4.9,
    direct_price: 6.99,
    nft_price: 12.99,
    investment_price_per_share: 5,
    available_shares: 20,
    total_shares: 100,
  },
  {
    id: "sample-4",
    title: "Crimson Sky",
    poster_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop",
    views: 89000,
    rating: 4.7,
    direct_price: 5.49,
    nft_price: 8.99,
    investment_price_per_share: 3,
    available_shares: 45,
    total_shares: 100,
  },
  {
    id: "sample-5",
    title: "Silent Echo",
    poster_url: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&h=1080&fit=crop",
    views: 112000,
    rating: 4.5,
    direct_price: 4.49,
    nft_price: 6.99,
    investment_price_per_share: 0,
    available_shares: 0,
    total_shares: 100,
  },
  {
    id: "sample-6",
    title: "Digital Horizon",
    poster_url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=450&fit=crop",
    views: 78000,
    rating: 4.4,
    direct_price: 3.99,
    nft_price: 5.99,
    investment_price_per_share: 1,
    available_shares: 90,
    total_shares: 100,
  },
];

const Browse = () => {
  const { data: dbFilms, isLoading } = useFilms();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Use database films if available, otherwise show samples
  const films = dbFilms && dbFilms.length > 0 ? dbFilms : sampleFilms;
  const featuredFilm = films[0];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <main className="md:ml-16 pt-16">
        {/* Featured Hero Banner */}
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img
            src={featuredFilm.poster_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop"}
            alt={featuredFilm.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
              <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs md:text-sm font-medium text-primary backdrop-blur-sm">
                <Star className="h-3 w-3 md:h-4 md:w-4 fill-primary" />
                Featured Film
              </span>
              <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">{featuredFilm.title}</h1>
              <p className="mb-4 flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-base text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 md:h-4 md:w-4 fill-primary text-primary" />
                  {featuredFilm.rating}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{featuredFilm.views.toLocaleString()} views</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-primary font-semibold">From ${featuredFilm.direct_price} USDC</span>
                {featuredFilm.available_shares > 0 && (
                  <>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:flex items-center gap-1 text-primary">
                      <TrendingUp className="h-4 w-4" />
                      {featuredFilm.available_shares} shares
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Categories */}
        <div className="border-b border-border bg-card/30 px-4 md:px-8 py-3 md:py-4 overflow-x-auto">
          <div className="mx-auto flex max-w-7xl items-center gap-3 md:gap-6 min-w-max md:min-w-0">
            <button className="flex items-center gap-2 rounded-full bg-primary px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 whitespace-nowrap">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
              Trending
            </button>
            <button className="flex items-center gap-2 rounded-full bg-secondary px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80 whitespace-nowrap">
              <Clock className="h-3 w-3 md:h-4 md:w-4" />
              New Releases
            </button>
            <button className="flex items-center gap-2 rounded-full bg-secondary px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80 whitespace-nowrap">
              <Star className="h-3 w-3 md:h-4 md:w-4" />
              Top Rated
            </button>
            <button className="flex items-center gap-2 rounded-full bg-secondary px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80 whitespace-nowrap">
              <Play className="h-3 w-3 md:h-4 md:w-4" />
              NFT Exclusives
            </button>
          </div>
        </div>

        {/* Films Grid */}
        <div className="px-4 md:px-6 py-4 md:py-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-3 md:mb-4 text-base md:text-lg font-medium text-muted-foreground/80">All Films</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-diamond" />
              </div>
            ) : (
              <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {films.map((film) => (
                  <FilmCard
                    key={film.id}
                    id={film.id}
                    title={film.title}
                    image={film.poster_url || ""}
                    views={film.views}
                    rating={film.rating}
                    directPrice={film.direct_price}
                    nftPrice={film.nft_price}
                    investmentPricePerShare={film.investment_price_per_share}
                    availableShares={film.available_shares}
                    totalShares={film.total_shares}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <section className="border-t border-diamond/10 bg-gradient-to-r from-card/30 via-card/50 to-card/30 px-4 md:px-6 py-6 md:py-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:gap-6 grid-cols-2 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-1 text-xl md:text-2xl font-medium text-diamond/80">{films.length}+</div>
              <div className="text-xs text-muted-foreground/60">Films</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-2xl font-medium text-diamond/80">
                {films.filter(f => f.available_shares > 0).length}
              </div>
              <div className="text-xs text-muted-foreground/60">Investments</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-2xl font-medium text-diamond/80">90%</div>
              <div className="text-xs text-muted-foreground/60">Creator Share</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-2xl font-medium text-diamond/80">10%</div>
              <div className="text-xs text-muted-foreground/60">NFT Royalty</div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
};

export default Browse;
