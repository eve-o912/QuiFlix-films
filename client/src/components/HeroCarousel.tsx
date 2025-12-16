import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight, Volume2, VolumeX, Info } from "lucide-react";
import { Button } from "./ui/button";

const featuredFilms = [
  {
    id: 1,
    title: "Neon Dreams",
    tagline: "Where reality meets the digital frontier",
    image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1920&h=1080&fit=crop",
    genre: "Sci-Fi Thriller",
    year: "2024",
    duration: "2h 15m",
    rating: "PG-13",
  },
  {
    id: 2,
    title: "Ocean's Edge",
    tagline: "Some secrets are meant to stay buried",
    image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop",
    genre: "Mystery Drama",
    year: "2024",
    duration: "1h 58m",
    rating: "R",
  },
  {
    id: 3,
    title: "Mind Palace",
    tagline: "The greatest prison is the one you build yourself",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop",
    genre: "Psychological Thriller",
    year: "2024",
    duration: "2h 32m",
    rating: "R",
  },
  {
    id: 4,
    title: "Crimson Sky",
    tagline: "When the world ends, hope begins",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop",
    genre: "Action Adventure",
    year: "2024",
    duration: "2h 05m",
    rating: "PG-13",
  },
  {
    id: 5,
    title: "Silent Echo",
    tagline: "Every voice leaves a trace",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&h=1080&fit=crop",
    genre: "Documentary",
    year: "2024",
    duration: "1h 45m",
    rating: "PG",
  },
];

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % featuredFilms.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + featuredFilms.length) % featuredFilms.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const currentFilm = featuredFilms[currentIndex];

  return (
    <div className="relative h-[90vh] w-full overflow-hidden">
      {/* Cinematic Film Grain Overlay */}
      <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Background Images with Ken Burns Effect */}
      {featuredFilms.map((film, index) => (
        <div
          key={film.id}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            index === currentIndex 
              ? "opacity-100" 
              : "opacity-0"
          }`}
        >
          <img
            src={film.image}
            alt={film.title}
            className={`h-full w-full object-cover transition-transform duration-[6000ms] ease-linear ${
              index === currentIndex ? "scale-110" : "scale-100"
            }`}
          />
          {/* Cinematic Gradient Overlays - Multiple layers for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
          {/* Vignette Effect */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
          }} />
        </div>
      ))}

      {/* Film Info with Enhanced Typography */}
      <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center">
        <div className="container mx-auto px-8 md:px-16 lg:px-24">
          <div className="max-w-3xl space-y-6">
            <div 
              className={`transition-all duration-700 delay-100 ${
                isTransitioning ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
              }`}
            >
              {/* Genre Badge with Glow */}
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {currentFilm.genre}
                </span>
                <span className="text-sm text-muted-foreground">{currentFilm.year}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{currentFilm.duration}</span>
                <span className="rounded border border-muted-foreground/50 px-1.5 py-0.5 text-xs text-muted-foreground">
                  {currentFilm.rating}
                </span>
              </div>

              {/* Title with Text Shadow */}
              <h2 className="mb-4 text-5xl font-black tracking-tight text-foreground md:text-7xl lg:text-8xl" style={{
                textShadow: '0 4px 30px rgba(0,0,0,0.5), 0 0 60px rgba(var(--primary),0.3)'
              }}>
                {currentFilm.title}
              </h2>

              {/* Tagline */}
              <p className="mb-8 text-xl font-light text-foreground/80 md:text-2xl lg:text-3xl italic">
                "{currentFilm.tagline}"
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Button size="lg" className="gap-3 text-lg px-8 py-6 shadow-[0_0_30px_rgba(var(--primary),0.4)] hover:shadow-[0_0_40px_rgba(var(--primary),0.6)] transition-shadow">
                  <Play className="h-6 w-6 fill-current" />
                  Watch Now
                </Button>
                <Button size="lg" variant="outline" className="gap-3 text-lg px-8 py-6 border-foreground/20 bg-background/20 backdrop-blur-md hover:bg-background/40">
                  <Info className="h-5 w-5" />
                  More Info
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mute/Unmute Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-32 right-8 z-20 rounded-full border border-foreground/20 bg-background/30 p-3 backdrop-blur-sm transition-all hover:bg-background/50"
      >
        {isMuted ? <VolumeX className="h-5 w-5 text-foreground" /> : <Volume2 className="h-5 w-5 text-foreground" />}
      </button>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/30 p-3 text-foreground backdrop-blur-sm transition-all hover:bg-background/50 hover:scale-110"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/30 p-3 text-foreground backdrop-blur-sm transition-all hover:bg-background/50 hover:scale-110"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Film Thumbnails */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-3">
          {featuredFilms.map((film, index) => (
            <button
              key={film.id}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentIndex(index);
                  setTimeout(() => setIsTransitioning(false), 700);
                }
              }}
              className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
                index === currentIndex 
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" 
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={film.image}
                alt={film.title}
                className="h-14 w-24 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-background/40 transition-opacity ${
                index === currentIndex ? "opacity-0" : "group-hover:opacity-0"
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/30">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / featuredFilms.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
