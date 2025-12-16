import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import heroBg from "@/assets/hero-bg.jpg";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="ml-16 pt-16">
        {/* Hero Section */}
        <section className="relative h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={heroBg} 
              alt="Cinema" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-hero" />
          </div>
          
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
            <h1 className="mb-4 text-6xl font-bold text-foreground">
              Own Your Movie <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Experience
              </span>
            </h1>
            <p className="mb-4 max-w-2xl text-lg text-muted-foreground">
              Stream premium films and own NFT tickets. No wallet?
            </p>
            <p className="mb-8 text-lg text-muted-foreground">
              No problem. Buy directly and claim your NFT anytime.
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon"
              onClick={() => navigate('/browse')}
            >
              Get Started
            </Button>
          </div>
        </section>

        {/* Features or Films Section */}
        <section className="px-8 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-3xl font-bold text-foreground">Featured Films</h2>
            <p className="text-muted-foreground">Discover and own exclusive film experiences...</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
