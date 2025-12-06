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
  
  // Use database films if available, otherwise show samples
  const films = dbFilms && dbFilms.length > 0 ? dbFilms : sampleFilms;
  const featuredFilm = films[0];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="ml-16 pt-16">
        {/* Featured Hero Banner */}
        <div className="relative h-[50vh] overflow-hidden">
          <img
            src={featuredFilm.poster_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop"}
            alt={featuredFilm.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="mx-auto max-w-7xl">
              <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                <Star className="h-4 w-4 fill-primary" />
                Featured Film
              </span>
              <h1 className="mb-2 text-5xl font-bold text-foreground">{featuredFilm.title}</h1>
              <p className="mb-4 flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {featuredFilm.rating}
                </span>
                <span>•</span>
                <span>{featuredFilm.views.toLocaleString()} views</span>
                <span>•</span>
                <span className="text-primary font-semibold">From ${featuredFilm.direct_price} USDC</span>
                {featuredFilm.available_shares > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-primary">
                      <TrendingUp className="h-4 w-4" />
                      {featuredFilm.available_shares} shares available
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Categories */}
        <div className="border-b border-border bg-card/30 px-8 py-4">
          <div className="mx-auto flex max-w-7xl items-center gap-6">
            <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
              <TrendingUp className="h-4 w-4" />
              Trending
            </button>
            <button className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80">
              <Clock className="h-4 w-4" />
              New Releases
            </button>
            <button className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80">
              <Star className="h-4 w-4" />
              Top Rated
            </button>
            <button className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80">
              <Play className="h-4 w-4" />
              NFT Exclusives
            </button>
          </div>
        </div>

        {/* Films Grid */}
        <div className="px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-6 text-2xl font-bold text-foreground">All Films</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <section className="border-t border-border bg-gradient-to-r from-card/50 via-card to-card/50 px-8 py-12">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">{films.length}+</div>
              <div className="text-sm text-muted-foreground">Films Available</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">
                {films.filter(f => f.available_shares > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Open for Investment</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">90%</div>
              <div className="text-sm text-muted-foreground">Creator Revenue Share</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">10%</div>
              <div className="text-sm text-muted-foreground">Secondary NFT Royalty</div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
};

export default Browse;
